# PJ: Sori

Sori helps international users learn Korean by sound, with English explanations and Korean learning content.

## Development

- Static HTML/CSS/JavaScript with browser Firebase CDN imports. No build or dependency install is required.
- Use Node.js 22+ and `npm test`, then `npm run dev` (http://127.0.0.1:4173).
- Keep product changes focused. Preserve existing phrase IDs, saved items and audio behavior during migrations.
- Use a separate branch for each change. Check the remote head before updating it; do not force-push over another agent's work.
- Never commit credentials or include private project notes in this public repository.
- Local pages still reference production Firebase, TTS and analytics. Use offline checks first. Real login, writes and deployment need the appropriate project configuration and authorized scope.
- Static tests do not prove browser audio, Google sign-in, Firestore sync or production readiness.

See README.md for the current setup, verification scope and known integration limitations.
