# Privacy rollout and publication checklist

## Preserve existing defaults before deployment

Earlier versions supplied some account-specific defaults from source code. The updated app uses generic placeholders and privately stored `user_defaults` records; it does not migrate production data automatically.

Before deploying or merging this change:

1. In the existing app, open **Edit defaults**, confirm the seller address and any notes, and save. This persists the full effective defaults to the database, including values previously supplied by code.
2. Save any important unsaved draft as an invoice. Very old drafts used an unscoped browser key and cannot safely be assigned to an account during automatic migration.
3. Confirm the database contains the desired defaults. Keep any data backups outside Git and protect them as personal financial data.

No existing invoice or database record is deleted by this PR. Scoped legacy drafts migrate into tab-local storage when that account opens the new editor; logout intentionally clears all invoice draft keys available to the tab.

## Verify the deployed application

Use synthetic accounts/data to verify authorized sign-in, denied sign-in, saving/loading/deleting invoices, editing defaults, printing and logout. Disable an already signed-in test user and verify subsequent invoice/default operations are denied. Check that one account cannot load or modify another account's invoice. Confirm the public-facing deployment still requires authorization.

The old app version can be restored by reverting the source/dependency commit while the repository remains private. The database format is unchanged. Browser drafts already cleared at logout or tab close are not recoverable; database-saved invoices remain available.

## Public source and private installations

This repository contains a sanitized source snapshot with fresh Git history. It does not contain credentials, invoice records, deployment configuration or the previous private repository's commits and PR discussions.

Keep environment files, database backups and real invoice exports outside tracked content. Use synthetic data for screenshots and demos, and a GitHub-provided noreply email for commits. Keep any invoice deployment access-controlled; a public source repository does not require a publicly accessible invoicing database.

Before publishing future changes, scan the staged content for secrets and review fixtures, screenshots, defaults and Git author/committer metadata for personal data. See [GitHub's sensitive-data removal guidance](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) if sensitive information is accidentally committed.
