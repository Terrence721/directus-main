# 📝 TODO

<!-- markdownlint-disable-next-line MD036 -->
**Last Updated: August 17, 2026**

A living list of what's done and what's left on this build. This is an independently maintained port of Directus's own monorepo — a real-time API/App dashboard for managing SQL database content — brought over **one package at a time**, evaluated and migrated as it comes in, not a wholesale copy of the source repo. See [architect.md](architect.md) for how it's put together.

## At a glance

**Done, in full:**

| Item | Detail |
|---|---|
| Repo bootstrap | git init, public GitHub repo live at [Terrence721/directus-main](https://github.com/Terrence721/directus-main) |
| Root scaffolding, license, policy docs | readme, license (MSCL), editor/git config, contributing/security/CLA/AI-usage policy — 14 files |
| Editor and lint tooling | ESLint, Prettier, Stylelint config; VS Code settings and recommended extensions — 7 files |
| Claude Code integration | `AGENTS.md`, lint/format-on-save hooks rewritten for Yarn — 5 files |
| Yarn workspace root config | `package.json`, `.yarnrc.yml`, `yarn.lock` — see "Yarn migration" below |
| Docker and deployment infra | Both Dockerfiles, `docker-compose.yml`, `docker-entrypoint.cjs`, `ecosystem.config.cjs`, custom `scripts/deploy-production.mjs` |
| CI and GitHub config | 18 workflows, the shared `prepare` action, CodeQL config, templates, `CODEOWNERS`, `FUNDING.yml` — 26 files |
| `directus` CLI package | Full source (6 files): `cli.js`, version helpers, license, readme |
| **All 43 workspace `package.json` manifests** | Migrated from pnpm's `catalog:` protocol to pinned Yarn-compatible versions — see "Package manifest migration" below |

**Still to do:** full source trees for 41 of 42 workspace packages (everything except `directus/`) and a handful of tracked follow-ups — see the "Still to do" section below.

## ✅ Done

### Yarn migration

The source repo is pnpm-native. Since Yarn has no equivalent for several pnpm-specific mechanisms, each one needed a real decision, not a find-and-replace:

| pnpm mechanism | Yarn replacement | Why |
|---|---|---|
| `catalog:` protocol (331-entry shared version table in `pnpm-workspace.yaml`, referenced 673 times across 40 files) | Every reference resolved to its concrete pinned version and inlined directly | Yarn has no shared-catalog mechanism at all |
| `pnpm.overrides` (7 entries) | Yarn `resolutions`, syntax translated (`"parent>child"` nesting → `"parent/child"`) | Confirmed working via a real `yarn install` |
| `pnpm run '/^build:.*/'` (regex script-matching, used in 4 packages) | Explicit script lists; `packages/extensions` and `packages/utils` (which need true concurrent watch-mode builds, not just sequential) additionally needed the `concurrently` package added — not in the original catalog, a real new dependency | Yarn has no regex script-filter syntax |
| `pnpm deploy --legacy --prod` (used by `test:blackbox` and both Dockerfiles to build a standalone production bundle) | Custom `scripts/deploy-production.mjs`, built on `yarn workspaces focus directus --production` | No Yarn equivalent exists. **Real behavioral difference, documented not hidden**: pnpm's deploy is non-destructive (builds a separate output folder); the Yarn replacement prunes the repo's own root `node_modules` in place, so the script carries an explicit warning not to run it on a persistent dev checkout |
| `pnpm fetch` (Docker layer-caching optimization — populates the store from just the lockfile, before the full source tree is copied in) | None — Docker now does one `COPY . .` then `yarn install` | Yarn workspaces need every workspace's `package.json` present to resolve at all, so there's no equivalent partial-copy trick without fragile `COPY --parents` wildcards. **A real Docker build-cache regression, accepted deliberately**: any source change now invalidates the install layer too |
| `onlyBuiltDependencies` allowlist (pnpm's default-deny list restricting which packages may run install/postinstall scripts) | `.yarnrc.yml`'s `enableScripts: true` (Yarn's permissive default) | Yarn Berry has no equivalent scoped allowlist. **A real security-posture downgrade, documented rather than silently accepted** |
| 4 stale/inconsistent `packageManager: pnpm@10.14.0` pins (`tests/e2e`, `tests/mock-license-server`, `tests/sandbox`, plus root's own `pnpm@10.27.0`) | All four unified to `packageManager: yarn@4.18.0` | Consistency |
| `@pnpm/workspace.find-packages`/`@pnpm/workspace.pkgs-graph`/`@pnpm/logger` (imported directly by `packages/release-notes-generator`'s source, not just a config reference) | `package.json` no longer lists them | The actual source rewrite is still owed — see "Still to do" |

Also verified empirically rather than assumed: `yarn workspaces foreach`/`focus` and `yarn npm publish` are core commands in Yarn 4.18.0 — no `@yarnpkg/plugin-workspace-tools` import needed, despite that being a real requirement in older Yarn Berry versions.

Corepack isn't bundled in this Node build (confirmed locally) — every place that previously assumed `corepack enable` just works (Dockerfiles, the CI `prepare` action) now runs `npm install -g corepack` first.

**`vitest` bumped to `4.1.10`** (latest, from the source's pinned `3.2.7`) across all 32 consuming packages — a deliberate decision to run current-latest rather than inherit the source pin. **Not yet verified against real config** — no package's `vitest.config.ts` has been copied over yet (see "Still to do"), so whether the 3.x→4.x breaking changes affect this repo's actual test setup is genuinely unconfirmed, not just unlikely.

### Package manifest migration

All 43 `package.json` files across the workspace, each individually inspected and transformed — not scripted blind. Grouped by what they are:

- **Core runtime** (3): `sdk`, `api`, `app` — `api`'s alone had ~130 `catalog:` references to resolve.
- **Extension system** (4): `extensions`, `extensions-registry`, `extensions-sdk`, `create-directus-extension`.
- **Storage drivers** (7): `storage` + 6 backend implementations (Azure, Cloudinary, GCS, local, S3, Supabase).
- **Core shared utilities** (19): `ai`, `composables`, `constants`, `env`, `errors`, `format-title`, `memory`, `pressure`, `schema`, `schema-builder`, `specs`, `stores`, `system-data`, `themes`, `types`, `update-check`, `utils`, `validation`, `visual-editing`.
- **Remaining tooling** (2): `create-directus-project`, `release-notes-generator`.
- **Test projects** (6): `blackbox` (+ its 2 extension fixtures), `e2e`, `mock-license-server`, `sandbox`.
- **`directus`** (1): full source, not just the manifest — see "At a glance" above.

**Repo-identity and attribution sweep**, done twice — the first pass used the wrong GitHub username entirely:

- `homepage`/`repository`/`funding` fields, `CODEOWNERS`, `FUNDING.yml`, and the repo-identity guards in maintenance workflows (`github.repository == '...'`) all pointed at a placeholder username (`terrence-daniels`) that turned out not to be the real authenticated account. Caught before anything was pushed, via `gh auth status` — corrected across 48 files to the real account, `Terrence721`.
- `author`/`maintainers`/`contributors` fields (28 files) swept from the original Directus maintainers' names to this fork's own attribution. The MSCL license text itself (`Copyright ... Monospace Inc.`) was **deliberately kept as-is**, a real decision, not an oversight — see `directus/license`.

### Root and policy docs, editor/lint config, CI, Docker

- `readme.md` (root and `directus/`) — the source repo's own root `readme.md` was a one-line stub (`directus/readme.md`, literally a redirect placeholder); replaced with the real README content pulled from `directus/readme.md`.
- `code_of_conduct.md` — the source pointed at `directus.com`'s own conduct policy (the real company's, not applicable to this fork); the link was removed rather than inventing replacement policy text.
- `.gitignore` — extended with a Yarn Berry section (`cache`, `unplugged`, `build-state.yml`, `install-state.gz`, `.pnp.*`); the source `.gitignore` was pnpm-only and had no equivalent.
- `.vscode/settings.json` — an orphaned `scssFormatter.singleQuote` setting (no matching recommended extension) removed; a `cSpell.words` allowlist added after the spell-checker flagged the project's own name and real contributor names as unknown words.
- `.github/copilot-instructions.md` — removed entirely (not this project's target IDE tooling); `AGENTS.md` is the single source of AI-assistant guidance now.
- All 18 workflows migrated off pnpm (`pnpm exec` → `yarn exec`, `pnpm run` → `yarn run`, `pnpm --recursive publish` → `yarn workspaces foreach --all --no-private npm publish`), plus the `pnpm-lock.yaml` path-trigger filters updated to `yarn.lock`.
- Both Dockerfiles: `NODE_VERSION` bumped 22→26 to match what's actually active; corepack bootstrap fixed; `pnpm fetch` pre-warming dropped (see "Yarn migration" above).

Commits: `eaf7cf3` (scaffolding/policy), `43696bf` (editor/lint), `0f88527` (Claude integration), `9febd69` (Yarn root config), `2c7aad6` (Docker/deploy), `91c2c5c` (CI/GitHub config), `d1d1e7f` (`directus` package), `ac0f0a1` (core runtime manifests), `10954b3` (extension system manifests), `426cb71` (storage driver manifests), `a64de46` (core utility manifests), `3e32174` (remaining tooling manifests), `8d8b181` (test project manifests).

### Real bug found and fixed: `isolated-vm` incompatible with Node 26

**Not an environment/toolchain problem — a genuine version incompatibility, caught by actually running CI, not assumed.** `isolated-vm@5.0.3` (the version inherited from the source repo's catalog) failed to compile identically on two different platforms: this Windows dev machine and the GitHub Actions Ubuntu runner (`gh run view --log-failed` pulled the real compiler output, not just the summary). The first hypothesis — a missing native build toolchain — was wrong, and disproven by the same log: every *other* native module in the ~2,150-package graph (`sqlite3`, `esbuild`, `@parcel/watcher`, etc.) built cleanly in the same install.

The real cause, visible in the actual g++ errors: `isolated-vm@5.0.3`'s C++ source (`class_handle.h`, `serializer_nortti.cc`) calls V8 APIs that Node 26's bundled V8 has since removed or changed the signature of — `v8::Template::SetAccessor` (removed), `v8::Object::GetIsolate()`/`GetPrototype()` (removed, `GetPrototypeV2()` is the replacement), `SetAlignedPointerInInternalField`/`GetAlignedPointerFromInternalField` (now require an extra `EmbedderDataTypeTag` argument), and a `v8::Maybe<T>`/`cppgc` header restructuring that broke several `Local<Object>`→`Local<Value>` conversions the addon relied on implicitly.

Fix: bumped `isolated-vm` to `7.0.1` (latest, `engines.node: ">=24.0.0"`) in `api/package.json`. Verified, not assumed — re-ran `yarn install` locally and confirmed it now builds successfully with no errors.

## 🚧 Still to do

Migration order is **manifests first, then real source**: every workspace already has a working `package.json` (done, above), so `yarn install` resolves the full dependency graph today even though most packages are source-empty. Adding real source to each one is purely additive from here — nothing about the root config needs to change as they land.

**CI build/test scoped to what actually exists, same practice as eShop-full's trimmed `.slnx`/`.slnf`.** Root `build`/`test`/`test:coverage` scripts use `yarn workspaces foreach --include directus` — `directus` is the only workspace with real source right now (and has no `build`/`test` scripts of its own, so this is currently a clean no-op rather than attempting all 42 workspaces and failing on the 41 that are still just manifests with an inherited `tsdown src/index.ts` build script pointing at a `src/` that doesn't exist yet). The `--include` list grows by name as each package's real source lands — not a permanent scoping decision, a rolling one.

| Item | Detail |
|---|---|
| Source tree: `sdk` | TypeScript SDK client — `src/`, `tests/`, `tsconfig.json`, `tsdown.config.ts`, `vitest.config.ts`, `readme.md`, `license` |
| Source tree: `api` | Express/Knex backend — largest single source tree in the repo |
| Source tree: `app` | Vue 3 dashboard |
| Source tree: 32 `packages/*` | Including `packages/release-notes-generator`'s `src/utils/process-packages.ts` rewrite — **specifically flagged**: still imports `@pnpm/workspace.find-packages`/`@pnpm/workspace.pkgs-graph` in the actual source even though the `package.json` dependency is already gone. Planned replacement: read each workspace's `package.json` directly (`yarn workspaces list --json` + `fs.readFileSync`) and build the internal dependency graph from `workspace:*` references — no package-manager-specific API needed |
| Source tree: `tests/*` | `blackbox` (+ 2 extension fixtures), `e2e`, `mock-license-server`, `sandbox` |
| `vitest` 3.2.7→4.1.10 compatibility | Bumped to latest across all 32 consuming packages, but no `vitest.config.ts` has been copied yet — real config compatibility with the 4.x line is unconfirmed |
| CI secrets not yet configured | `Check` now installs cleanly (see the `isolated-vm` fix above), but workflows depending on secrets (`CLAUDE_CODE_OAUTH_TOKEN`, `RELEASE_PAT`, `DOCKERHUB_USERNAME`/`PASSWORD`, `SLACK_WEBHOOK_CMS_FREEZE`) not yet configured on `Terrence721/directus-main` — e.g. `Sync Readme to Docker Hub` — will keep failing until those are set |
| Docker build not yet tested end-to-end | Needs the real source trees, the `isolated-vm` fix, and a real run of `scripts/deploy-production.mjs` to confirm the assembled `dist/` actually boots |
