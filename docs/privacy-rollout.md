# Privacy rollout and publication checklist

## Preserve existing defaults before deployment

Earlier versions supplied some account-specific defaults from source code. The updated app uses generic placeholders and privately stored `user_defaults` records; it does not migrate production data automatically.

Before deploying or merging this change:

1. In the existing app, open **Edit defaults**, confirm the seller address and any notes, and save. This persists the full effective defaults to the database, including values previously supplied by code.
2. Save any important unsaved draft as an invoice. Very old drafts used an unscoped browser key and cannot safely be assigned to an account during automatic migration.
3. Confirm the database contains the desired defaults. Keep any data backups outside Git and protect them as personal financial data.

No existing invoice or database record is deleted by this PR. Scoped legacy drafts migrate into tab-local storage when that account opens the new editor; logout intentionally clears all invoice draft keys available to the tab.

## Verify the deployed application

Use synthetic accounts/data to verify first-time Google sign-in, repeat sign-in, saving/loading/deleting invoices, editing defaults, printing and logout. Disable an already signed-in test user and verify both new sign-ins and subsequent invoice/default operations are denied. Check that one account cannot load or modify another account's invoice or defaults. Confirm unauthenticated visitors cannot access invoice data.

## Public Google registration

Registration uses the existing `users` table; no schema migration or changes to existing invoices/defaults are needed. New verified Google emails are normalized and inserted with the `user` role. Existing identities, names, roles and disabled status are preserved, including legacy mixed-case email addresses. Concurrent sign-ins use the existing email uniqueness constraint and reread the account when another request wins the insert.

Before deploying, set `NEXTAUTH_URL` to this deployment's canonical domain and register `<domain>/api/auth/callback/google` in Google Cloud. Use an External OAuth audience. The basic identity scopes requested by this app are exempt from Google's test-user restriction, including while the OAuth app is in Testing. Reusing environment variables from a different deployment also reuses its callback URL until this setting is changed.

To roll back automatic registration, revert its source commit. Existing records are retained. The older allowlist code still admits accounts registered during the public-registration period because those active users now exist in the database; reverting does not revoke them. Disable individual accounts explicitly when revocation is desired.

The old app version can be restored by reverting the source/dependency commit while the repository remains private. The database format is unchanged. Browser drafts already cleared at logout or tab close are not recoverable; database-saved invoices remain available.

## Public source and private installations

This repository contains a sanitized source snapshot with fresh Git history. It does not contain credentials, invoice records, deployment configuration or the previous private repository's commits and PR discussions.

Keep environment files, database backups and real invoice exports outside tracked content. Use synthetic data for screenshots and demos, and a GitHub-provided noreply email for commits. Keep any invoice deployment access-controlled; a public source repository does not require a publicly accessible invoicing database.

Before publishing future changes, scan the staged content for secrets and review fixtures, screenshots, defaults and Git author/committer metadata for personal data. See [GitHub's sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) if sensitive information is accidentally committed.
