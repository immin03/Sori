# Production release checklist

Target: the existing sorikorea.com service and immin03/Sori main branch. This is a public release; the SQLite preview is not the production datastore.

## Prepared

- Editorial, mobile-first home, learning, quiz, newsletter and Seoul trip screens.
- `supabase/trip-storage.sql`: dedicated private-schema tables, RLS, explicit privilege revocation, service-role-only SECURITY INVOKER RPC, database locks, optimistic versions, one-time invitations, member revocation and shared creation budgets.
- `supabase/functions/sori-trips/`: bounded JSON handler, approved-origin CORS, capability authentication through the RPC, date/catalog validation and server-only database credentials. Deploy with verify_jwt=false because this function checks its own random trip membership capabilities, rather than using Supabase Auth JWTs. Existing Korean-learning login remains Firebase.
- `tests/production-trips.test.cjs`: actual Postgres execution with PGlite, including permissions, shared edits, revoked access, reused/expired invitations, concurrent redemption, eight-person cap and rate budget. This is local Postgres verification, not hosted-project verification.

## Release sequence

1. Select the owner's Supabase organization and obtain a project cost quote. Do not reuse unrelated business databases. Obtain agreement before a nonzero charge.
2. Create the dedicated Sori project in Seoul (ap-northeast-2), wait until healthy, inspect its tables, and apply the reviewed SQL once using apply_migration.
3. Deploy the Edge Function and include index.js, handler.js, validation.js, catalog.json and package.json. Read the new secret-key environment map; the legacy server key is a compatibility fallback. Never copy these credentials to the browser or GitHub.
4. Verify hosted creation, two distinct guest capabilities, comments, stale writes, reused/expired invites, revocation and rejection of direct anonymous table/RPC access. Run Supabase security/performance advisors and resolve relevant notices.
5. Set js/config.js tripsApiBase to the deployed function URL. This public endpoint is not a credential. No secret key or publishable key is needed in the trip frontend because each trip operation has its own capability.
6. Run npm ci, npm test and mobile browser checks. Recheck main's head for intervening changes, merge the release PR, and confirm the live domain serves the new HTML and assets.
7. Verify the live app's create/join/comment flows and existing audio. Keep the previous main SHA for a reversible rollback. Do not label the release complete from a Git commit alone.

## Known V1 boundaries

Seoul only, 1–3 days, English and Korean, fifteen sourced suggestions, browser-scoped guest access and periodic updates. No live venue availability, measured transit routes, account recovery, automatic social posting or multilingual rollout. These need separate implementation; they are not silently enabled by this release. Automated metadata/card generation, Japanese and simplified/traditional Chinese localization remain on the roadmap. No PDF or print export is part of the travel product.

## Local validation on 19 November 2026

`npm test` passes 30 tests. The editorial home fits browser frames at 360, 390, 430 and 768 CSS px; the 390 px itinerary renders and creates successfully on the local development API. Cloud TTS playback completed and advanced the practice counter from 0 to 1. These results do not establish hosted Supabase readiness or live-domain deployment.
