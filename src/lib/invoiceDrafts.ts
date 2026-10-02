const DRAFT_PREFIX = "invoice-data";

export function getInvoiceDraftKey(userId: number): string {
  return `${DRAFT_PREFIX}:${userId}`;
}

/** Move this account's legacy draft into tab-local storage without losing it. */
export function readInvoiceDraft(key: string, email: string): string | null {
  const current = sessionStorage.getItem(key);
  const legacyKey = `${DRAFT_PREFIX}:${email.toLowerCase()}`;
  let legacy: string | null;
  try {
    legacy = localStorage.getItem(legacyKey);
  } catch {
    return current;
  }
  if (legacy) {
    // Only remove the legacy copy after the tab-local write succeeds.
    sessionStorage.setItem(key, current ?? legacy);
    localStorage.removeItem(legacyKey);
  }
  return current ?? legacy;
}

/** Clear only invoice drafts, including old unscoped/email-based storage keys. */
export function clearInvoiceDrafts(): void {
  for (const getStorage of [() => localStorage, () => sessionStorage]) {
    try {
      const storage = getStorage();
      const keys = Array.from({ length: storage.length }, (_, i) => storage.key(i));
      for (const key of keys) {
        if (key === DRAFT_PREFIX || key?.startsWith(`${DRAFT_PREFIX}:`)) {
          storage.removeItem(key);
        }
      }
    } catch {
      // Storage access can be disabled; it must not prevent ending the session.
    }
  }
}
