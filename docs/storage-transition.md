# Storage transition candidate

Status: implementation for review, not deployed. Firebase Auth and the existing cloud TTS URL are retained. The default storage provider remains Firestore. No cloud data was read or migrated during development.

## Account data

SavedStore uses `soriSaved:user:<Firebase UID>` for each account. The historical unscoped `soriSaved` cache is preserved as `soriSaved:legacy-backup` on first initialization, but is not automatically attributed to the next person signing in. An account's existing Firestore `users/<uid>.savedList` is read without changing phrase IDs. Failed changes remain pending per account and replay on a later sign-in or online event. Adds and removals are atomic, so a slow read or concurrent device does not require replacing the entire saved array. Acknowledged remote changes from other devices appear on the next sync; this is not a realtime subscription.

## Supabase activation gates

1. Identify a dedicated Sori Supabase project or isolated schema scope; do not reuse unrelated project data without review. Snapshot existing Firestore documents and preserve each UID and exact phrase ID.
2. Add Firebase Third-party Auth for `sori-533fc` in Supabase. Existing and new users need `role: authenticated` custom claims, set by trusted Firebase Admin tooling. Refresh tokens after claim assignment. Never put Admin credentials or a service-role key in the browser.
3. Apply `supabase/saved-storage.sql` to a test project, once. Policies are drafts until tested against two separate real users and an unauthenticated client. Hosted Supabase must reject unregistered Firebase projects; self-hosted setups also need issuer/audience restrictions. See official sources below.
4. Import backed-up `savedList` entries into one row per `(user_id, phrase_id)`, idempotently. Validate per-user counts and compare exact ID sets; no deletion from Firestore. Resolve writes during cutover with a planned pause or incremental delta, rather than overwriting active changes with an old snapshot.
5. Set `window.SoriConfig` before `js/state.js` runs, in a reviewed configuration script: `{storageBackend:'supabase', supabaseUrl:'https://PROJECT.supabase.co', supabasePublishableKey:'PUBLIC_KEY'}`. This repository deliberately does not include live configuration or enable the new provider.
6. Test login, sign-out, user switching, existing saves, add/remove, offline changes and denied access to another user's data. Keep Firebase auth and TTS separate from the DB switch.
7. Rollback must reconcile new Supabase saves back into Firestore before switching, or preserve unsynced changes for replay. Switching a flag alone cannot synchronize two different databases. Browser pending operations do not migrate already acknowledged records between providers.

## Remaining live checks

Google popup/redirect behavior and authorized origins; Firebase Firestore rules; production TTS content type/CORS/playback; mobile layout; Supabase ownership policies and role claims. An installation failure for a management plugin does not replace these account checks. No service creation, billing changes, production writes or deployments have been performed.

## Sources checked 2026-11-19

- https://firebase.google.com/docs/web/modular-upgrade
- https://firebase.google.com/docs/firestore/manage-data/add-data
- https://supabase.com/docs/guides/auth/third-party/firebase-auth
