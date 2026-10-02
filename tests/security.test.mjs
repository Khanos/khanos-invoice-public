import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

function load(file, mocks, names) {
  let source = stripTypeScriptTypes(fs.readFileSync(path.join(import.meta.dirname, '..', file), 'utf8'));
  source = source.replace(/^import[\s\S]*?;\s*$/gm, '').replace(/^export /gm, '');
  const context = { console: globalThis.console, process: { env: { NODE_ENV: 'test' } }, ...mocks };
  vm.createContext(context);
  vm.runInContext(source + '\nthis.exports={' + names.join(',') + '};', context, { filename: file });
  return context.exports;
}
const validation = load('src/lib/invoiceValidation.ts', {}, ['parseInvoiceData', 'isRecordId']);
const fixture = () => ({
  title: 'INVOICE', invoiceNumber: 'DEMO-1', issueDate: '2026-10-02', dueDate: '',
  seller: { name: 'Example Seller', address: 'Example Address', taxId: 'DEMO', email: 'seller@example.com', phone: '', website: '' },
  client: { companyName: 'Example Client', address: '', country: '', email: 'client@example.com', phone: '' },
  lineItems: [{ id: 'item-1', description: 'Example work', amountUSD: 120, amountEUR: 100 }],
  taxRate: 21, exchangeRate: 0.85, subtotalEUR: 999, taxAmountEUR: 999, totalEUR: 999, notes: [],
});

function harness(user, session = { user: { id: 7, email: 'reviewer@example.com' } }) {
  const calls = [];
  const auth = load('src/lib/auth.ts', {
    GoogleProvider: options => options,
    getServerSession: async () => session,
    getUserById: async id => { calls.push(['authorization', id]); return user; },
    getUserByEmail: async () => user,
  }, ['authOptions', 'getCurrentUserId', 'getCurrentUser']);
  const actions = load('src/app/actions/invoice.ts', {
    ...validation,
    getCurrentUserId: auth.getCurrentUserId,
    logServerError: () => {},
    getInvoicesByUser: async id => { calls.push(['list', id]); return []; },
    getInvoiceById: async (id, userId) => { calls.push(['load', id, userId]); return { data: fixture() }; },
    createInvoice: async (userId, data) => { calls.push(['create', userId, data]); return 99; },
    updateInvoice: async (id, userId, data) => { calls.push(['update', id, userId, data]); return true; },
    deleteInvoice: async (id, userId) => { calls.push(['delete', id, userId]); return true; },
  }, ['saveInvoiceAction', 'getInvoicesAction', 'loadInvoiceAction', 'deleteInvoiceAction']);
  const routes = load('src/app/api/user-defaults/route.ts', {
    ...validation,
    getCurrentUser: auth.getCurrentUser,
    getUserDefaultsFromDb: async id => { calls.push(['defaults-read', id]); return fixture(); },
    saveUserDefaults: async (id, data) => { calls.push(['defaults-write', id, data]); return true; },
    mergeWithPlaceholderDefaults: data => data,
    NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200, headers: options?.headers }) },
    logServerError: () => {},
  }, ['GET', 'PUT']);
  return { auth, actions, routes, calls };
}
const active = { id: 7, email: 'reviewer@example.com', role: 'user', is_active: true };

for (const [label, user, session] of [
  ['inactive', { ...active, is_active: false }],
  ['deleted or database unavailable', null],
  ['reassigned database ID', { ...active, email: 'different@example.com' }],
  ['no session', active, null],
]) {
  test(`all sensitive entry points deny ${label} users`, async () => {
    const { auth, actions, routes, calls } = harness(user, session);
    assert.equal(await auth.getCurrentUserId(), null);
    assert.equal((await actions.saveInvoiceAction(fixture())).success, false);
    assert.equal((await actions.getInvoicesAction()).length, 0);
    assert.equal(await actions.loadInvoiceAction(99), null);
    assert.equal((await actions.deleteInvoiceAction(99)).success, false);
    assert.equal((await routes.GET()).status, 401);
    assert.equal((await routes.PUT({ json: async () => fixture() })).status, 401);
    assert.equal(calls.filter(c => c[0] !== 'authorization').length, 0);
  });
}

test('active users retain owner-scoped CRUD and defaults', async () => {
  const { actions, routes, calls } = harness(active);
  assert.equal((await actions.saveInvoiceAction(fixture())).id, 99);
  assert.equal((await actions.saveInvoiceAction(fixture(), 99)).success, true);
  await actions.getInvoicesAction();
  assert.ok(await actions.loadInvoiceAction(99));
  assert.equal((await actions.deleteInvoiceAction(99)).success, true);
  const get = await routes.GET();
  assert.equal(get.status, 200);
  assert.equal(get.headers['Cache-Control'], 'private, no-store');
  assert.equal((await routes.PUT({ json: async () => fixture() })).status, 200);
  for (const call of calls.filter(c => c[0] !== 'authorization')) {
    assert.equal(call[['update', 'load', 'delete'].includes(call[0]) ? 2 : 1], 7);
  }
});

test('JWT updates remove revoked identity instead of retaining authorization', async () => {
  const { auth } = harness({ ...active, is_active: false });
  const token = await auth.authOptions.callbacks.jwt({ token: { userId: 7, role: 'user', email: active.email }, trigger: 'update' });
  assert.equal(token.userId, undefined);
  assert.equal(token.role, undefined);
  assert.equal(await auth.authOptions.callbacks.signIn({ user: { email: active.email }, account: { provider: 'google' } }), '/login?error=AccessDenied');
});

test('validated writes recompute totals and strip unknown nested fields', async () => {
  const data = fixture(); data.privateExtra = 'discard'; data.seller.privateExtra = 'discard';
  const parsed = validation.parseInvoiceData(data);
  assert.equal(parsed.subtotalEUR, 100); assert.equal(parsed.taxAmountEUR, 21); assert.equal(parsed.totalEUR, 121);
  assert.equal(parsed.privateExtra, undefined); assert.equal(parsed.seller.privateExtra, undefined);
  const { actions, calls } = harness(active);
  await actions.saveInvoiceAction(data);
  assert.equal(calls.find(c => c[0] === 'create')[2].totalEUR, 121);
});

for (const [label, mutate] of [
  ['missing seller', d => { delete d.seller; }],
  ['invalid date', d => { d.issueDate = '2026-02-30'; }],
  ['empty title', d => { d.title = ' '; }],
  ['nonfinite amount', d => { d.lineItems[0].amountEUR = Infinity; }],
  ['string amount', d => { d.lineItems[0].amountEUR = '100'; }],
  ['invalid exchange rate', d => { d.exchangeRate = 0; }],
  ['oversized note', d => { d.notes = ['x'.repeat(2001)]; }],
  ['oversized line list', d => { d.lineItems = Array(101).fill(d.lineItems[0]); }],
  ['duplicate item ID', d => { d.lineItems.push({ ...d.lineItems[0] }); }],
  ['wrong optional website type', d => { d.seller.website = {}; }],
]) {
  test(`save and defaults reject ${label} without database writes`, async () => {
    const data = fixture(); mutate(data);
    const { actions, routes, calls } = harness(active);
    assert.equal((await actions.saveInvoiceAction(data)).success, false);
    assert.equal((await routes.PUT({ json: async () => data })).status, 400);
    assert.equal(calls.filter(c => c[0] !== 'authorization').length, 0);
  });
}

test('invalid invoice IDs and malformed JSON are rejected', async () => {
  const { actions, routes, calls } = harness(active);
  for (const id of [0, -1, 1.5, NaN, '99', Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal((await actions.saveInvoiceAction(fixture(), id)).success, false);
    assert.equal(await actions.loadInvoiceAction(id), null);
    assert.equal((await actions.deleteInvoiceAction(id)).success, false);
  }
  assert.equal((await routes.PUT({ json: async () => { throw new SyntaxError(); } })).status, 400);
  assert.equal(calls.filter(c => c[0] !== 'authorization').length, 0);
});

test('in-progress drafts can have unfinished fields without weakening server writes', () => {
  const data = fixture(); data.title = ''; data.invoiceNumber = ''; data.issueDate = ''; data.exchangeRate = 0;
  assert.ok(validation.parseInvoiceData(data, true));
  assert.equal(validation.parseInvoiceData(data), null);
});

function storage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    get length() { return values.size; }, key: i => [...values.keys()][i] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key),
  };
}
function drafts(local, session) {
  return load('src/lib/invoiceDrafts.ts', { localStorage: local, sessionStorage: session }, ['getInvoiceDraftKey', 'readInvoiceDraft', 'clearInvoiceDrafts']);
}

test('legacy migration preserves the correct account draft without reading another account or unscoped data', () => {
  const local = storage({ 'invoice-data:reviewer@example.com': 'draft-A', 'invoice-data:other@example.com': 'draft-B', 'invoice-data': 'unscoped' });
  const session = storage(); const helpers = drafts(local, session);
  assert.equal(helpers.getInvoiceDraftKey(7), 'invoice-data:7');
  assert.equal(helpers.readInvoiceDraft('invoice-data:7', 'Reviewer@Example.com'), 'draft-A');
  assert.equal(session.getItem('invoice-data:7'), 'draft-A');
  assert.equal(local.getItem('invoice-data:reviewer@example.com'), null);
  assert.equal(local.getItem('invoice-data:other@example.com'), 'draft-B');
  assert.equal(helpers.readInvoiceDraft('invoice-data:8', 'new@example.com'), null);
});

test('failed migration retains the legacy draft and current tab drafts take precedence', () => {
  const local = storage({ 'invoice-data:reviewer@example.com': 'legacy' });
  const session = storage({ 'invoice-data:7': 'current' }); const helpers = drafts(local, session);
  session.setItem = () => { throw new Error('storage disabled'); };
  assert.throws(() => helpers.readInvoiceDraft('invoice-data:7', active.email));
  assert.equal(local.getItem('invoice-data:reviewer@example.com'), 'legacy');
  const session2 = storage({ 'invoice-data:7': 'current' });
  assert.equal(drafts(local, session2).readInvoiceDraft('invoice-data:7', active.email), 'current');
  assert.equal(session2.getItem('invoice-data:7'), 'current');
});

test('logout clears all legacy and tab-local invoice drafts while retaining preferences', () => {
  const local = storage({ 'invoice-data': 'old', 'invoice-data:reviewer@example.com': 'draft', 'invoice-locale': 'es' });
  const session = storage({ 'invoice-data:7': 'draft', 'invoice-data:8': 'other', theme: 'dark' });
  drafts(local, session).clearInvoiceDrafts();
  assert.equal(local.length, 1); assert.equal(local.getItem('invoice-locale'), 'es');
  assert.equal(session.length, 1); assert.equal(session.getItem('theme'), 'dark');
});

test('blocked local storage does not stop clearing accessible session storage', () => {
  const local = { get length() { throw new Error('blocked'); } };
  const session = storage({ 'invoice-data:7': 'draft' });
  assert.doesNotThrow(() => drafts(local, session).clearInvoiceDrafts());
  assert.equal(session.length, 0);
});

test('server error logging excludes raw database details and credentials', () => {
  const logged = [];
  const { logServerError } = load('src/lib/serverErrors.ts', { console: { error: (...args) => logged.push(args) } }, ['logServerError']);
  logServerError('Save failed', { code: '23505', detail: 'private-record', connection: 'private-connection' });
  logServerError('Save failed', { code: 'private-code', message: 'private-message' });
  const output = JSON.stringify(logged);
  assert.ok(output.includes('23505')); assert.ok(output.includes('UNKNOWN')); assert.ok(!output.includes('private-'));
});

test('personal defaults remain database-owned and placeholder examples stay generic', () => {
  const { mergeWithPlaceholderDefaults, getPlaceholderDefaults } = load('src/lib/userDefaults.ts', { generateId: () => 'demo' }, ['mergeWithPlaceholderDefaults', 'getPlaceholderDefaults']);
  const saved = fixture(); saved.seller.address = 'Private database address'; saved.notes = ['Private database note'];
  const merged = mergeWithPlaceholderDefaults(saved);
  assert.equal(merged.seller.address, saved.seller.address); assert.equal(merged.notes[0], saved.notes[0]);
  assert.equal(getPlaceholderDefaults().seller.address, 'Your Address');
});
