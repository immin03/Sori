# Sori: map, practice and stories

## Design decisions and benchmarks

The primary goal is frequent, easy use on a phone, not an editorial showcase. Home presents three real actions: practise, read Korea 101, and plan together. Content is revealed when requested rather than making users read a long itinerary.

- Wanderlog: one map connected to stays and daily places. Source: https://wanderlog.com/ . Adopted the relationship between a place selection and its detail panel; no copied branding or claim of equivalent route calculation.
- TripIt: departure/accommodation context and a mapping app handoff. Source: https://help.tripit.com/en/support/solutions/articles/103000063354-navigator . Adopted explicit origin/destination legs.
- Duolingo: short active practice and returning to material over time. Sources: https://blog.duolingo.com/spaced-repetition-for-learning/ and https://blog.duolingo.com/duolingo-teaching-method/ . Implemented a small independent recall scheduler, not Duolingo's model or effectiveness claims.

## Map behaviour

Leaflet 1.9.4, with its bundled BSD-2-Clause license, supplies one interactive map. OpenStreetMap supplies the base tiles with visible attribution, standard browser caching, origin-only referrers and no tile prefetch. Google Maps is the transport/search handoff. Google Maps JavaScript/Routes/Places keys are not configured, so this is not a Google base-map integration or a live Google route engine.

The app shows approximate catalog pins, ICN T1/T2, GMP and PUS, an explicitly selected shared accommodation and numbered day stops. Tapping a pin or stop rail changes the detail panel. Airport selection offers the airport-to-hotel leg; the day can start at the hotel, arrival airport or an explicitly requested device location. Hotel pins, arrival and start preference are shared trip fields. Device coordinates remain in page memory and are excluded from server normalization. A refresh needs device location again.

Dashed paths connect visit order, not roads. Distances and the optional reorder use great-circle pin distances. Station hints are guidance, not live directions, accessible paths or calculated boarding instructions. Each actual leg opens Google Maps with explicit origin/destination and selected transit/walking/driving mode. Transit legs do not use unsupported multi-waypoint routing. No fabricated fares, departure times or travel-time estimates are shown.

Public-hotel name searches go through a server proxy to Nominatim only when the visitor presses Search or Enter. A shared R2 ETag gate allows only one request at a time and at least 1.5 seconds between starts across the app, with seven-day caching, an identifying User-Agent and no autocomplete. SORI_GEOCODER_URL permits an operational provider change. Search failure retains manual map pinning. Policy: https://operations.osmfoundation.org/policies/nominatim/ and https://operations.osmfoundation.org/policies/tiles/ .

## Learning

Five-expression active recall: try the English prompt, reveal Korean, listen naturally or slowly, and self-assess. Again returns after about ten minutes; remembered material advances through simple 1/3/7/14-day intervals. This is self-reported recall, not speech recognition or a pronunciation score. Paused sessions, last phrase, review dates and daily unique counts persist in device storage, separately per Firebase UID or anonymous device profile; anonymous history is not silently assigned to a signed-in account. No paid AI conversation calls were introduced.

The classic library searches all 358 expressions, lists matching results, supports hiding translation/pronunciation, and offers a cancellable three-listen practice with speaking pauses. Saved words retain their existing Firebase behavior.

## Stories and email

See korea101-publishing.md. Sori hosts the reader, saves/public sharing, reactions and subscription waitlist itself. The only external email provider integration is an optional confirmation adapter; sending accounts, domain verification and a bulk newsletter send pipeline remain unconfigured. No actual campaign was sent.
