# Korea 101 publishing workflow

Korea 101 is now a native Sori reading service, not an external Beehiiv landing page. The three core services are everyday Korean practice, Korea 101 stories and a collaborative Korea travel map. Public stories can be saved on-device, shared by their public /stories/<id>/ URL and given anonymous Useful/Curious reactions. Reactions are not a moderated discussion forum or verified-person counts.

## Source of truth

Public frontend: https://sorikorea.com/ . Repository: immin03/Sori, main branch. Read the latest main and data/stories.json before any change. Publishing a new validated entry to that file through a normal branch/PR merge publishes it through the existing GitHub Pages workflow. Do not replace or truncate previous entries, rewrite trip code, access subscriber records, or include private user information in GitHub.

An unattended writer can use the same connected GitHub source operations verified for this project. Make a branch from the fresh main SHA, create the reviewed tree and commit, open a PR, merge only the expected head, and verify the Pages result. Reject a changed parent/ref lease and reread; never force-push. The schedule prompt is self-contained and names this file; it contains no credentials.

## Editorial format

Write one original English story, approximately 250–450 words, with a strong opening, a specific Korean custom or everyday moment, useful context and a warm question. Use short paragraphs and plain words. Address curious international readers. Avoid stereotypes, treating a habit as universal, invented first-person experiences, fabricated Minwoo quotes and promotional filler. No em dashes. Maintain the voice of Korea 101 by Sori.

Rotate culture, food, language, everyday life, current Korean cultural topics and practical travel. Avoid repeating the most recent topics. Prefer 1–3 primary sources, verify changing facts and dates, and preserve exact source URLs. No live prices, schedules, opening hours or legal/health advice without verification. Respect source quotation limits; write original explanations.

Every entry has id (unique lowercase letters/numbers/hyphens, <=80), title, category, excerpt, photo (existing licensed local asset), photoAlt, minutes, question, phrase, paragraphs, sources[{label,url}], published (actual Seoul date YYYY-MM-DD), author ('Korea 101 by Sori'), photoContext and status ('published'). Prepend the new entry. Run `node scripts/build-stories.cjs` and commit its generated `stories/<id>/index.html` too; those static pages supply social previews and open the native reader. A category is Useful Korean, Everyday culture, Food & traditions, Places or Getting around. The Korean phrase must exactly match an existing expression in the normalized daily/travel/drama/trendy/numbers data so Listen & practise opens a real lesson. Label any contextual image accurately and reuse the documented photo credits.

The six founder newsletters are published in the same dated feed as the newer stories. Their complete article bodies are in content/newsletters. Subscriber records are separate from editorial content.

## Email boundary

The active Site has no email-provider credentials. The live form therefore clearly joins an email waitlist; it does not claim that email delivery has started. The backend stores consent in private R2 records, allows cancellation and requires an emailed confirmation when delivery is enabled. A waitlist record is not a confirmed subscriber. No personal Gmail bulk mail, imported contacts, undisclosed migration or automatic mailing to the waitlist is authorized by this workflow.

The optional confirmation adapter needs a verified sending identity in SORI_MAIL_FROM and a server-only RESEND_API_KEY. Sender/domain verification and campaign delivery are still prerequisites for a real newsletter send pipeline. The current code implements confirmation and cancellation, not a bulk campaign sender. Never claim that publication of a story sent an email. A future campaign must use confirmed recipients only, include a working permanent unsubscribe link, enforce idempotency and delivery limits, and be exercised through the actual authorized sender before enabling scheduled delivery.

## Current launch checks

Story reader, local save, public sharing shape, durable anonymous reaction totals, waitlist consent and cancellation, and mocked double opt-in are covered by the release verification. Account-specific learning progress is stored locally and is not a cloud learning-history sync. Native Google login and real phone hardware remain separate checks.

## Active publication schedule

The owner-linked publication task is enabled for Monday, Wednesday and Friday at 09:00 Asia/Seoul, starting 2026-11-20. It updates this frontend repository through the connected GitHub writer. A successful scheduled task must report a verified public story URL; creation of the schedule alone is not evidence that a later run published. This schedule publishes web stories, not email campaigns.
