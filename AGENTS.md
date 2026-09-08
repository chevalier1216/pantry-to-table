# Pantry to Table

Read README.md, docs/product.md and docs/status.md before changing behavior. GitHub chevalier1216/pantry-to-table is canonical; Sites is a deployment mirror.

- Keep the user interface in Traditional Chinese, responsive and keyboard accessible.
- Never assume staples, quantities, equipment, stock availability, walking routes or verified videos.
- Strict mode must validate aggregated known whole-meal quantities; descriptive stock stays unquantified and shows precise recipe needs for the user to compare. Respect explicit equipment choices; the explicit any option removes equipment filtering. Unknown restrictions must be resolved before recommendation.
- Keep API keys server-only, local .env ignored, and production values out of Git. Do not commit user inputs, locations, account data or chat history.
- Use small modules and focused tests for pantry constraints. Run npm run test:core, npm run typecheck, and npm test before claiming completion; skip repetitive full builds when the verified source has not changed.
- Keep pending external credentials and integration limitations explicit. Do not remove failed tests to hide a product defect.
- Preserve existing user work. Make development changes on a branch and provide a reviewable PR; do not merge or change Site audience without authorization.
- Do not require routine user confirmations for reversible implementation and verification already authorized in the session.
