# Pantry to Table Implementation Plan

**Goal:** Deliver a usable Traditional Chinese meal-planning beta and preserve it in the user's public GitHub repository.
**Architecture:** React working surface; pure catalog/parser/planner modules; optional server-only AI extraction and walking-store providers. Every extracted field remains editable before planning.
**Tech Stack:** bundled Vinext/React/TypeScript, plain ES modules for deterministic core, Node built-in tests; no extra dependencies.
**Spec:** docs/product.md

## Global constraints
No implicit staples; aggregate quantities for the whole meal; fail closed for unresolved restrictions; never invent store inventory, routes, or video verification. Keep secrets server-side. One new project checkout; GitHub is canonical, Sites is the deployment mirror.

## Task 1 — constraints and meal planning
Files: lib/catalog.mjs, lib/planner.mjs, tests/planner.test.mjs.
Interfaces: parseInput(text) => draft; planMeals({inventory, people, minutes, equipment, exclusions, mode, shoppingMinutes}) => {plans, issues}.
- [x] Write tests for strict shortages, shared ingredient quantities, exclusions, missing equipment, time ceiling and Chinese extraction; run `node --test tests/planner.test.mjs` and observe failure.
- [x] Implement explicit unit-based pantry data and original recipe steps. Reject invalid quantities and unknown restrictions; scale and schedule serially.
- [x] Run the same tests and fix only observed failures.

## Task 2 — working surface and providers
Files: app/page.tsx, app/globals.css, app/layout.tsx, app/api/parse/route.ts, app/api/stores/route.ts, lib/providers.mjs.
- [x] Build input → editable confirmation → recommended meal → step-by-step teaching flow using existing form primitives.
- [x] Provider defaults return unavailable states; configured AI yields only catalog fields; configured Maps returns only measured WALK routes within limit.
- [x] Include explicit location submission and outbound search fallbacks. Clear stale recommendations when confirmed constraints change.
- [x] Test provider validation and missing-key behavior without external credentials.

## Task 3 — publish and preserve
Files: README.md, AGENTS.md, .env.example, docs/status.md, LICENSE (preserve original).
- [x] Run `node --test tests/planner.test.mjs tests/providers.test.mjs` and the required Sites build.
- [x] Review public file set for credentials, private data and starter content.
- [x] GitHub installation restored write access; prepare the complete initial implementation on a new branch for PR review, preserving the original MIT license and main history.
- [x] Exact source saved to deployment mirror; owner-only beta deployment verified succeeded.
- [x] Report actual working features and unconfigured external-service limitations.
