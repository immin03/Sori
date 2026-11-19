# Sori production deployment

## Active architecture

- Public frontend: https://sorikorea.com, source immin03/Sori main branch.
- Trip API: https://sori-shared-trips-api.flutedsloth32.chatgpt.site/api . Public API entry, private trip records.
- Server hosting project: appgprj_6afea68eebbc819194f31bbb0b53b610. Source snapshot: hosting/trips-api; deployed source repository is also retained by Sites.
- Server source commit: b41e70733ddb15111d8d5126f903346ab2e68a90; saved version 2. Manifest r2 binding is the string BUCKET; d1 is unused.
- Trips are server-only R2 JSON documents. ETag compare-and-swap commits all membership, invitation, plan and note changes together. Stale plan versions return 409; concurrent notes retry rather than disappear. Invite lookups never grant access without the matching current trip invitation.
- Random membership and invitation secrets are hashed before server storage. Responses omit stored hashes and invitation state. Invite links are single-use, expire after seven days and can be revoked. Up to eight active members; a maximum of 100 historical memberships bounds document growth. Notes are capped at 200, with the latest 60 returned.
- Creation budgets: 20 per peer hash/hour plus a shared 200/hour initial global budget. The Worker uses the platform-provided client address header and stores only its hash. This is a beta budget, not a comprehensive abuse or WAF service.
- Korean learning retains Firebase authentication, Firestore saved words and the existing Cloud Functions audio service. No credentials were copied into client code.

## Why no active Supabase project

Creation in the selected organization was quoted at $0/month but rejected by the provider because an administrator had reached the two-free-project account limit. No project was created, no company project was paused/deleted and no paid plan was accepted. The alternative Worker/R2 API was implemented to complete the public trip service without requiring changes to existing business databases.

The Supabase SQL/RPC/Edge Function implementation remains an optional future migration. Its private schema, RLS and privileges were executed locally using PGlite; it was not applied to a hosted Supabase project.

## Rebuild and update the API

The complete host source is in hosting/trips-api. Its src files are a deployment snapshot of server/object-trips.js, supabase/functions/sori-trips/handler.js, validation.js and data/places.json. Keep these synchronized when changing the API.

1. Run npm test from the Sori root.
2. Run npm run build in hosting/trips-api; the build emits a single dependency-free Worker at dist/server/index.js plus the manifest copy.
3. Obtain a fresh source repository write credential for the same Site. Keep it in memory and pass it through stdin only; scripts/sync.mjs uses a per-process Git header, never a persisted token. Do not create a second Site.
4. Push the exact reviewed source. Package root .openai/hosting.json and dist/server/index.js together in the deployment archive. Packing only server/index.js without dist is not supported.
5. Save and deploy that pushed commit with the archive. Preserve the existing public API audience because it serves the public Sori app; trip authorization remains inside the API. Never turn on raw bucket public access.
6. Verify with actual browser create, refresh, invite, guest comments, editing and revocation, then update frontend js/config.js only if the API origin changed.

## Verification and boundaries

Local tests cover SQLite, actual Postgres execution, whole-document CAS conflicts, permissions, expiry, revocation and private response filtering. Native server deployment succeeded; browser API health and actual trip creation work through the deployed Worker/R2 binding. Some non-browser HTTP probes are rejected at the hosting edge and do not reach the Worker; browser flows remain the release verification path.

V2: Seoul and Busan, one to three days per city, English and Korean learning, 29 catalog entries including explicitly labelled flexible cafe/meal slots, browser-scoped guest memberships and periodic updates. Venue availability, measured transit routes, verified dietary matching, account recovery, scheduled social publishing and multilingual rollout require further development. No PDF/print travel feature exists.


## Speak-first release verification

The second release prioritizes Korean listening and out-loud practice on the home screen, with direct slow/natural audio and situation shortcuts. Four-step mobile trip setup connects to photo-led itineraries, primary Google Maps search/directions, embedded area maps, context-specific Korean phrases and Korea 101. Existing phrase IDs, Firebase login and saved words are retained. Audio adds bounded session caching and playback feedback, without claiming a new voice model or speech assessment.

Offline: 39 tests cover existing account isolation, TTS cancellation/cache, city separation, image paths, map destinations and production storage authorization/concurrency. Browser frame checks at 360/390/430/768/1100 pixels found no horizontal overflow on a shared trip. A phone frame created a Busan trip, rendered an actual Google map, opened a real Korean lesson, completed cloud audio playback and returned to the same trip. These are browser-frame checks, not Android/iOS hardware certification.
