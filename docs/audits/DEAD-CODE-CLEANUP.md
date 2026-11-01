# Dead Code Cleanup & Repository Optimization

**Project:** mamaysporto

**Audit date:** 1 November 2026 (Asia/Jakarta)

**Status:** Active-deployment cleanup applied for CLN-001, CLN-002, and CLN-004. Candidates that can affect CMS behavior, public URLs, archived integrations, or historical records remain untouched.

**Scope:** Current worktree, including uncommitted changes from the prior security-remediation task.

> The audit phase was read-only. After approval, the cleanup removed only unreferenced root assets/motion tokens and the root `prettier` development dependency. No environment file, database, deployment, or external service was changed. I did not read `.env` or `.env.local` values.

## 1. Executive Summary

The supported root site is a SolidJS/Vite frontend with an Express/PostgreSQL API, a CMS admin area, local media uploads, and a self-hosted Docker Compose/GitHub Actions deployment. No Vercel, Supabase, OpenRouter, or Gemini SDK call is present in the root runtime or current root dependency manifest.

The current worktree already contains previous approved removals: `vercel.json`, the root `ChatAI` UI/CSS, `ChatTicker`, and other inactive components are deleted relative to `HEAD`; root AI/Supabase dependencies have already been removed. These are not new edits in this audit. There is no root `/api/chat` route.

High-confidence root cleanup items applied: three unreferenced source assets, unused motion constants/CSS token, and `prettier`, which is not used by the active root build, test, lint, or deployment workflow. `sumur-creative` is copied to the deployment host by `rsync` but is excluded from the Docker image and active application; its candidates are outside this root-app cleanup scope. `public/icons.svg`, the AI settings fields, and Gemini/AI Studio materials remain because public or external use has not been excluded. In particular, the Hero “YOWMAN” button is active and must remain unless its external destination is confirmed obsolete.

CLN-001, CLN-002, and CLN-004 have been applied. The Supabase SQL, database schema, historical deployment/security documents, nested prototype, and externally referenced assets remain untouched because they are outside the active root image/runtime or require external-use validation.

## 2. Technology & Active Features

| Area | Current implementation | Evidence |
|---|---|---|
| Root frontend | SolidJS, JSX, Vite; public sections for Hero, About, Skills, Projects, Experience, Contact, and a skills marquee | `src/index.jsx`, `src/App.jsx`, `src/sections/`, `src/components/Marquee.jsx` |
| Root admin | Hash-routed CMS admin with login, account, content, settings, upload, toast, and confirmation flows | `src/index.jsx`, `src/admin/AdminLayout.jsx`, `src/admin/panels/` |
| API/runtime | Express routes for auth, data collections, uploads, health, and a catch-all API 404 | `server/index.js:79-106`, `server/auth.js`, `server/routes/` |
| Data/storage | PostgreSQL schema/seed plus numbered active migrations; uploads in a Docker volume | `database/`, `database/migrations/`, `compose.yaml` |
| Deployment | Docker Compose and one self-hosted GitHub Actions deployment workflow; Traefik config/helper are separate operational files | `compose.yaml`, `.github/workflows/deploy.yml`, `opt/ingress/`, `scripts/sync-ingress-gateway.sh` |
| Separate prototype | `sumur-creative/` is an independent React/TypeScript/Vite prototype; root README marks it archived. Dockerfile does not copy it into the image and CI has no nested build/check step, although the workflow's broad `rsync` copies repository files to the host directory. It has no lockfile. | `README.md`, `.github/workflows/deploy.yml:43-54`, `Dockerfile:12-36`, `sumur-creative/package.json`, `sumur-creative/README.md` |

The root Hero’s Yowman CTA remains functional: `Hero.jsx:49-59` opens the configured link, while `HeroPanel.jsx:114-119` edits its label and destination. `Marquee.jsx` is also active, but it displays skill names; it is not the removed AI chat ticker.

## 3. Legacy Integration Inventory

| Integration | Current worktree evidence | Classification and disposition |
|---|---|---|
| Vercel | `vercel.json` is absent from the worktree (tracked as deleted relative to `HEAD`); no `.vercel/`, Vercel SDK, Vercel script, or Vercel workflow was found. The only deployment workflow uses self-hosted Docker. | **Legacy integration, root runtime removed.** Keep the existing deletion. Confirm whether an external Vercel project is still intended before treating the service itself as retired. Historical plan/audit text should be retained or labeled as historical, not treated as current instructions. |
| Supabase | No Supabase client/package/runtime calls in root. `supabase/` still contains schema and SQL setup/migration history. README explicitly calls it legacy and says it does not change an already provisioned project. | **Legacy integration; external state unknown.** Keep SQL/history until its recovery value and any live project are confirmed. Do not drop database columns or alter live policies in this cleanup. |
| Root AI Chat/OpenRouter | Root `ChatAI.jsx`, `ChatAI.css`, and `ChatTicker.jsx` are already deleted in the worktree; there is no chat API route or AI SDK in the root manifest. `server/index.js:99-106` exposes auth/data/upload routes and then returns 404 for other API paths. | **Root feature code already removed.** No additional AI UI/API/dependency deletion identified in the root tree. |
| Dormant AI settings | `SiteSettingsPanel.jsx:204-227` still edits `chat_ticker_text` and `ai_system_prompt`; `server/routes/data.js:19-23` allows writes to both. Its public projection at `:29-33` returns `chat_ticker_text` but excludes `ai_system_prompt`; the prompt is available only through the authenticated private read path. `Marquee.jsx` does not consume either field. | **Potential dead configuration.** No local consumer found, but a separate Yowman service/external API client or preserved setting may depend on them. Validate before changing the API response/write contract or removing stored data. |
| Gemini / AI Studio | `sumur-creative` README and `.env.example` mention Gemini/AI Studio, and `metadata.json:5` declares server-side Gemini capability. No source import/call reads `GEMINI_API_KEY` or invokes Gemini; the current nested manifest has no Gemini SDK. | **Needs validation.** The prototype is marked archived in root docs, but the README names an external AI Studio app. Do not remove the metadata, env example, or actual `.env.local` without confirming that external app is retired. |

The prior security audit at `opt/AUDIT-KEAMANAN.md` describes a different application shape, including old Supabase, Vercel, and `/api/chat` paths. It is not a current security guide. The newer `docs/audits/CODEBASE-AUDIT.md` now labels its findings as an initial snapshot and has a remediation ledger; preserve it as audit history.

## 4. Confirmed Dead Code Candidates

These candidates had no source, style, HTML, config, or import references in the current worktree. They were initially recommendations; CLN-001 and CLN-002 were subsequently applied after explicit approval, as recorded in Section 12.

### CLN-001 — Unreferenced root source assets

- **Classification:** Confirmed dead code.
- **Files:** `src/assets/hero.png`, `src/assets/solid.svg`, `src/assets/vite.svg`.
- **Evidence:** Repository-wide reference search found no import, CSS URL, HTML path, or runtime name reference. The active Hero imports `ppTama.jpeg` as its image fallback (`src/sections/Hero.jsx:12,65-69`); the favicon comes from `public/favicon.svg` (`index.html:5`).
- **Impact:** These files are not part of the current Vite import graph; deleting them reduces tracked source clutter by roughly 23 KB but should not change the served bundle.
- **Cleanup status:** Applied after approval; only these three assets were deleted.
- **Regression risk:** Low; a future component could expect one of these starter assets, but no current references exist.
- **Verification:** Completed after deletion: removed-reference search, root lint/tests, Vite build to a temporary output directory, and `git diff --check` all passed. The active `ppTama.jpeg` fallback and favicon remain in the source references.

### CLN-002 — Unused animation exports and CSS token

- **Classification:** Confirmed dead code.
- **Files:** `src/lib/motion.js:6,9-10` (`EASE_SNAP`, `DURATION_FAST`, `DURATION_BASE`) and `src/index.css:40` (`--duration-base`).
- **Evidence:** Each symbol is defined but has no import/use in the repository. The `motion.js` module itself is active for `animate`, `stagger`, `utils`, and motion preferences; `--ease-snap` and `--duration-fast` are used and must remain.
- **Impact:** Unused exports/tokens add maintenance noise but do not materially affect bundle/runtime.
- **Cleanup status:** Applied after approval; removed only the three unused exports and `--duration-base`, while retaining the shared motion module and other used tokens.
- **Regression risk:** Low, provided removal is limited to the unreferenced names.
- **Verification:** Completed after removal: reference search, root lint/tests, Vite build, and `git diff --check` all passed.

### CLN-003 — Unused API/dependency in the archived nested prototype

- **Classification:** Confirmed unused by source graph; prototype lifecycle is separate.
- **Files:** `sumur-creative/package.json:17` (`motion`) and `sumur-creative/src/utils/audio.ts:54-78` (`soundFx.playThud`).
- **Evidence:** No nested source imports `motion`; no caller of `soundFx.playThud()` was found. Other audio helpers in the same module may still be used and should be retained.
- **Impact:** The package and method do not contribute to the nested source graph. Removing the package changes only the nested manifest; it does not affect the supported root app.
- **Recommended cleanup:** Remove the unused `motion` dependency and `playThud` method only if the nested prototype is still maintained locally. If the prototype remains archived/unsupported, deferring this cleanup is reasonable.
- **Regression risk:** Low within the checked source; external AI Studio builds or scripts are not represented by this repository.
- **Verification:** Confirm no runtime/external consumer, search nested references, and run the nested typecheck/build only if its dependency environment is intentionally restored. There is no nested lockfile and no nested `node_modules` was used for this audit.

## 5. Potential Dead Code / Needs Validation and Resolved CLN-004

### CLN-004 — Root `prettier` development dependency

- **Classification:** Confirmed unused by active root build/deploy automation; potential manual contributor-tool use is not represented in the repository.
- **Files:** `package.json`, `package-lock.json` (removed in this cleanup).
- **Evidence:** Before removal, the manifest and lockfile were the only functional references. Audit documentation also mentions the finding. There was no Prettier config, npm script, source import, or CI invocation. The workflow uses `npm ci`, lint, tests, and Docker build; the production Docker stage installs with `npm ci --omit=dev`.
- **Impact:** The dependency is no longer installed during root CI validation; it never entered the production image. Website runtime/build output is unchanged.
- **Cleanup status:** Removed from the root manifest and lockfile for the active deployment scope.
- **Regression risk:** A developer who invoked Prettier manually from this project loses that CLI; no deployed-site behavior impact is expected.
- **Verification:** `npm test`, `npm run lint`, root build, direct dependency check, manifest/lockfile reference search, and `git diff --check` passed.

### CLN-005 — Orphaned AI Chat settings and persisted fields

- **Classification:** Potential dead configuration; local consumer absent, external consumer unknown.
- **Files:** `src/admin/panels/SiteSettingsPanel.jsx:204-227`, `server/routes/data.js:19-33`, `database/01-init.sql:100-101`, `database/02-seed.sql:102-115`, `supabase/chat_ticker_text.sql:6-12`.
- **Evidence:** The CMS still allows editing `chat_ticker_text` and `ai_system_prompt`; the visitor app has no chat component or ticker consumer. The active `Marquee` reads the `skills` collection instead. The public settings projection still includes `chat_ticker_text`; the system prompt is private.
- **Recommended cleanup:** If confirmed unused externally, remove the obsolete CMS controls and corresponding runtime read/write allowlist/projection references. Preserve the database columns, existing data, seed history, and Supabase SQL in this pass; do not drop schema or delete stored values without a separate migration/backup decision.
- **Regression risk:** Could break an external client or the external Yowman service, and changing the public settings projection changes its API shape. The Hero CTA still points to a configurable external destination, so its purpose must not be inferred from its label alone.
- **Verification:** Confirm no external service/API client reads or writes the fields; inspect the public API contract; test all current site settings controls and Hero Yowman link after any approved change.

### CLN-006 — Nested Gemini environment/config references

- **Classification:** Potentially obsolete environment/documentation; needs external validation.
- **Files:** `sumur-creative/.env.example`, `sumur-creative/README.md`, `sumur-creative/metadata.json`.
- **Evidence:** `GEMINI_API_KEY` and `APP_URL` are listed in the nested example but not read in source. Nested README points to an AI Studio app; `metadata.json` declares server-side Gemini capability. The current source manifest has no Gemini SDK.
- **Recommended cleanup:** If the external AI Studio app is retired, remove obsolete Gemini setup text/capability and the unused sample variable names. Do not read or delete `.env.local`; do not change secrets in an external service.
- **Regression risk:** Removing platform metadata or setup guidance could break an externally hosted app even though local source has no Gemini call.
- **Verification:** Check the owner-controlled AI Studio app/deployment and secret bindings before changing those files.

### CLN-007 — Public SVG sprite without an in-repository reference

- **Classification:** Potential dead asset.
- **File:** `public/icons.svg`.
- **Evidence:** No source, CSS, HTML, or config reference found. Vite copies files from `public/` to the output root, so the asset remains directly available as a public URL. Social icons in the current app are inline SVG (`src/lib/socialIcons.jsx:34-45`).
- **Recommended cleanup:** Remove only after checking that no external page, bookmark, or integration consumes the public asset URL.
- **Regression risk:** A consumer outside the repository could reference `/icons.svg` directly.
- **Verification:** Search repository and deployment/static logs or confirm with the site owner; rebuild and compare output after approval.

### CLN-008 — Superseded security/deployment documents

- **Classification:** Confirmed stale documentation; historical value should be retained.
- **Files:** `opt/AUDIT-KEAMANAN.md`; historical deployment plan `docs/superpowers/plans/2026-10-24-proxmox-lxc-traefik-profile-deployment.md`.
- **Evidence:** The old security audit refers to Supabase auth, Vercel, `/api/chat`, and files no longer in the root runtime. The migration plan contains historical steps that describe replacing those systems. Current README and deployment spec describe Compose/PostgreSQL and legacy integrations.
- **Recommended cleanup:** Do not delete these history files. Add a short “superseded/historical” notice and link to the current README/audit only after approval. Keep `docs/audits/CODEBASE-AUDIT.md` as the historical snapshot; its introduction already distinguishes initial findings from the current remediation ledger.
- **Regression risk:** Removing history would lose project provenance; changing old documents may affect links or operator workflows.
- **Verification:** Check inbound links and preserve the original content when labeling the documents.

## 6. Dependency Classification

### Root manifest

| Classification | Packages | Evidence / action |
|---|---|---|
| Required runtime | `animejs`, `bcryptjs`, `cors`, `express`, `jsonwebtoken`, `multer`, `pg`, `solid-js`, `three` | Imports or active runtime entrypoints use them. `three` is loaded by dynamic import in `src/components/HeroScene.jsx:49`, so static-import-only scans would be insufficient. Keep. |
| Required tooling | `concurrently`, `eslint`, `eslint-plugin-solid`, `vite`, `vite-plugin-solid` | Used by root dev/build/lint scripts or `vite.config.js`/`eslint.config.js`. Keep. |
| Removed from active root tooling | `prettier` | No script/config/CI/source use found; removed from manifest and lockfile. Manual CLI availability is no longer provided. |
| Legacy/unused in root | Vercel SDKs, Supabase SDK, OpenRouter/AI SDKs, Gemini SDK | None are in the current root manifest/lockfile, and no root source call was found. No further root dependency removal is proposed for these. |

### Nested `sumur-creative` manifest

| Classification | Packages / items | Evidence / action |
|---|---|---|
| Used by nested build/source | React, React DOM, Lucide React, Vite, React Vite plugin, Tailwind/Tailwind Vite plugin, TypeScript, Node types | Referenced by nested TSX/config/compiler setup; keep if the prototype remains buildable. |
| Confirmed unused by nested source | `motion` | No import/call found. Candidate for removal from nested `package.json` only after confirming the separate prototype lifecycle. |
| Already absent from current manifest | `@google/genai` | The current worktree manifest has no Gemini SDK, and no source call exists; it remains mentioned only in AI Studio docs/config metadata. Its manifest removal is already present in the worktree from prior changes, not this cleanup pass. |
| Lockfile status | None | `sumur-creative/` has no npm/yarn/pnpm lockfile. Root `npm audit` does not cover its dependency tree. Do not claim its dependency set is reproducible or audited. |

`npm ls --depth=0` succeeded for the root tree after a clean install. This command verifies the installed direct tree, not whether a dependency is used by source. The initial security-audit snapshot reported 18 root advisory entries; a later post-remediation recheck reported 0 across 316 root dependencies. This active-deployment cleanup also reran `npm audit --omit=dev` successfully with 0 vulnerabilities; `npm ci --ignore-scripts` reported 0 across its installed dependency tree.

## 7. Environment Variables

| File | Names/status | Recommendation |
|---|---|---|
| Root `.env.example` | Database bootstrap/runtime, `DATABASE_URL`, migration connection, JWT, proxy, port, and `NODE_ENV` names correspond to Compose/server/scripts. Values were not printed. | No obsolete root variable confirmed; retain. |
| `sumur-creative/.env.example` | `GEMINI_API_KEY` and `APP_URL` are not read by current nested source. README/metadata still describe an AI Studio/Gemini app. | Potentially obsolete; validate the external app before removing names/docs. No actual `.env.local` was read. |
| Historical docs only | Legacy names such as OpenRouter and Supabase variables appear in old audit/migration text, not current root config. | Keep only as historical references or mark the documents superseded. Do not remove external secrets. |

## 8. Files Recommended for Cleanup and Files to Preserve

### Cleanup candidates and implementation state

| Item | Reason | Scope |
|---|---|---|
| `src/assets/hero.png`, `src/assets/solid.svg`, `src/assets/vite.svg` | Confirmed no runtime/build references | **Done under CLN-001:** deleted these three files only. |
| Unused exports `EASE_SNAP`, `DURATION_FAST`, `DURATION_BASE` | No import/call sites | **Done under CLN-002:** removed declarations, kept `src/lib/motion.js`. |
| CSS token `--duration-base` | No consumer | **Done under CLN-002:** removed only this token. |
| `sumur-creative/src/utils/audio.ts::soundFx.playThud` | No caller in nested source | Remove only the method; preserve used audio helpers. |
| `motion` from `sumur-creative/package.json` | No source imports | Remove only if the nested prototype remains in cleanup scope; its external lifecycle needs confirmation. |
| `prettier` from root `package.json` and lockfile | No automated/project usage | **Done under CLN-004:** removed; no effect on production image, but manual CLI use is no longer available. |
| Dormant AI controls/API fields | No local visitor-side consumer | Conditional on external-consumer check; do not drop database columns/data. |

### Preserve

- `public/favicon.svg`, `src/assets/ppTama.jpeg`, all active site/admin components, `src/lib/api.js`, auth/URL/sanitizer/WhatsApp helpers, root runtime dependencies, and build configuration.
- `src/components/Marquee.jsx`, the active Hero Yowman CTA, and its label/link fields: they have current call sites.
- `public/icons.svg` until external URL use is excluded.
- `database/01-init.sql`, `database/02-seed.sql`, active numbered migrations, all `supabase/*.sql`, and existing data/schema history. No active database schema change is part of this cleanup plan.
- `opt/ingress/dynamic/profile-mamay.yml`, `scripts/sync-ingress-gateway.sh`, Docker/Compose, and the current self-hosted workflow.
- `sumur-creative/metadata.json`, Gemini docs/env example, and any actual ignored local environment file until the external AI Studio status is confirmed.
- Historical plan/audit documents; add a superseded label instead of deleting their provenance.

## 9. Regression Risks

1. Deleting `chat_ticker_text` from the public settings response could break an external client even though the root frontend does not consume it.
2. Removing `ai_system_prompt` controls/API access could affect a separate Yowman service or remove access to persisted prompt data. The Hero link is an active external link and is not a deletion candidate without confirmation.
3. Removing `public/icons.svg` could break a consumer that references its URL directly.
4. Removing `prettier` means an undocumented manual formatting workflow would need a separately installed formatter; the active website build/runtime is unaffected.
5. The nested prototype is marked unsupported but has AI Studio metadata; no local build/lockfile is available to validate its external behavior.
6. `supabase/` SQL might be useful for recovery or an existing external project; deleting it would lose history and does not clean a provisioned service.
7. The current worktree contains prior uncommitted remediation and pre-existing local file state. Future cleanup must avoid overwriting those changes or the existing `docs/LXC-10018-SETUP.md` deletion and `docs/HOMELAB-SSOT.md` addition.

## 10. Remaining Candidates Outside the Active-Deployment Cleanup Scope

1. **Root dead code/tooling:** **complete**—CLN-001 assets, CLN-002 unused exports/token, and CLN-004 unused build dependency removed; active helpers and UI remain.
2. **Nested prototype (CLN-003):** excluded from the root Docker build/image and CI checks, but copied to the deployment host directory by `rsync`; retained because it is an archived standalone project outside the active application runtime.
3. **Dormant chat fields (CLN-005):** validate the external Yowman consumer and API usage. If confirmed unused, remove UI/runtime references but preserve DB columns/data and Supabase history in this pass.
4. **Gemini / AI Studio references (CLN-006):** retain until the separate external AI Studio app and its deployment are confirmed retired.
5. **Public SVG sprite (CLN-007):** retain until use of the directly addressable `/icons.svg` URL is ruled out.
6. **Historical documents (CLN-008):** label `opt/AUDIT-KEAMANAN.md` and the completed migration plan as superseded/historical; do not delete them.

The remaining candidates are intentionally preserved: CLN-005 can alter CMS/API behavior and may have an external consumer; CLN-006 concerns a separate AI Studio app; CLN-007 is copied into the public build and could be consumed by URL; CLN-008 is historical documentation. They require separate scope or validation before removal.

## 11. Baseline Validation and Post-Cleanup Verification Plan

### Baseline checks run before cleanup

| Check | Result |
|---|---|
| `npm test` | Passed; uses mocked PostgreSQL at `127.0.0.1:1` and temporary upload fixtures. No production DB was contacted. |
| `npm run lint` | Passed with no warnings. |
| Root Vite build | Passed to `/tmp/mamaysporto-cleanup-baseline`; the Three.js chunk is 518.36 kB raw / 129.65 kB gzip and emits Vite's existing size warning. |
| `npm ls --depth=0` | Passed for root direct dependencies. |
| `git diff --check` | Passed. |

### Post-cleanup checks for CLN-001/002/004

| Check | Result |
|---|---|
| `npm test` | Passed; mocked DB and temporary upload fixtures. |
| `npm run lint` | Passed without warnings. |
| Vite build after CLN-001/002 | Passed to `/tmp/mamaysporto-cleanup-final`; Three.js chunk remains 518.36 kB raw / 129.65 kB gzip and emits the existing size warning. |
| `npm ci --ignore-scripts` | Passed, reified the current lockfile without lifecycle scripts; audit reported 0 vulnerabilities. |
| `npm audit --omit=dev` | Passed; 0 vulnerabilities. |
| `npm ls --depth=0` | Passed after clean install; no extraneous root dependency. |
| Post-cleanup root Vite build | Passed to `/tmp/mamaysporto-audit-build.GHtmWY`; Three.js chunk remains 518.36 kB raw / 129.65 kB gzip and emits the existing size warning. |
| Docker image build / deployment | Not run: the local Docker daemon is unavailable. No push, production sync, migration, or deployment was triggered. |
| Removed-reference search | No references to the removed assets, exports, CSS token, or `prettier` remain in root source/config/manifest/lockfile. |
| `git diff --check` | Passed. |

No changes were made to deployed UI/API behavior, dependency versions other than removing `prettier`, or external configuration. If more items are approved later, run the relevant checks again for that scope:

- Search all imports/exports, CSS/HTML/config references, dynamic imports, npm scripts, workflow steps, and route registrations for every approved deletion.
- Root `npm test`, `npm run lint`, `npm run build -- --outDir=/tmp/mamaysporto-cleanup-final --emptyOutDir`, `npm ls --depth=0`, `npm audit --json`, and `git diff --check`.
- Compare active root app output, admin settings behavior, Hero external CTA, and `/api/data/site_settings` response if any AI field/API change is approved.
- If nested cleanup is approved, use its own dependency setup/typecheck/build only after confirming the prototype is in scope. It currently has no lockfile and no installed dependency tree.
- Confirm `.env`/`.env.local`, database schema/data, external secrets, deployment files, and services were not changed.

## 12. Cleanup Changes Made After Approval

CLN-001 and CLN-002 were explicitly approved earlier. The subsequent active-deployment cleanup request authorized removal of items unused by the root build/deployment; it was applied narrowly to CLN-004 because the other remaining candidates either affect runtime/public contracts or are outside the active deployment.

| File | Change |
|---|---|
| `src/assets/hero.png` | Deleted; no source/config references. |
| `src/assets/solid.svg` | Deleted; no source/config references. |
| `src/assets/vite.svg` | Deleted; no source/config references. |
| `src/lib/motion.js` | Removed unused `EASE_SNAP`, `DURATION_FAST`, and `DURATION_BASE` exports; retained active animation helpers and exports. |
| `src/index.css` | Removed unused `--duration-base`; retained other used motion tokens. |
| `package.json` | Removed the unused root `prettier` development dependency. |
| `package-lock.json` | Removed the corresponding `prettier` package entries using npm; no other dependency versions were intentionally changed. |

No runtime dependencies, schemas, external services, settings fields, active UI/API contracts, or deployment configuration were changed. The pre-existing worktree changes from the prior remediation task were preserved.
