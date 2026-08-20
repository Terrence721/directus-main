# Architecture Overview

<!-- markdownlint-disable-next-line MD036 -->

**Last Updated: August 17, 2026**

This document describes the architecture directus-main is being built toward — verified against the real source app
(Directus's own monorepo, snapshotted locally at `F:\directus-main\directus-main`) and against what has actually landed
in this repo, not a generic description of what a headless-CMS platform "usually" looks like. See [todo.md](todo.md) for
exactly how much of this exists right now.

**Current status, stated plainly:** every workspace package's `package.json` (43 of them) has been copied over and
migrated from pnpm to Yarn — dependency versions resolved, scripts rewritten. Root config, Docker/deployment
infrastructure, and all `.github/` CI are fully migrated. `directus/` (the thin CLI wrapper, 6 files) has a **complete**
source tree, though **not yet a runnable one** — `cli.js` imports `@directus/update-check` and dynamically imports
`@directus/api/cli/run.js`, both still manifest-only, so `node directus/cli.js` fails on its first import today; same
"manifests first" tolerance as everything else mid-migration, just not previously written down for this package.
`types/` is **partially started** (43 of ~54 planned files — `src/index.ts` already exports from 11 modules that don't
exist yet, so it doesn't type-check as a whole; see `todo.md`). `sdk/`, `api/`, `app/`, the other 31 `packages/*`, and
all 4 `tests/*` projects exist on disk as manifests only — `yarn install` succeeds and resolves the full dependency
graph, but there's no application code to run yet. Everything below describing the full system is the target this repo
is being built toward one file at a time, not a claim that it already runs end-to-end.

## 1. What this is

Directus is a real-time API and App dashboard for managing SQL database content — REST/GraphQL APIs auto-generated from
your database schema, a Vue 3 management Studio, and a native MCP server for AI agents. This fork
(`Terrence721/directus-main`) is an independently maintained port of Directus's own monorepo, not a wholesale copy:
source files are being brought over deliberately, and the project's package-management tooling has been switched from
pnpm to Yarn along the way — a real, load-bearing change, not just a rename.

## 2. Monorepo, not a single package

Directus's own architecture is the starting point here, not something being redesigned from scratch. It's a genuine
monorepo because the pieces have real, different reasons to be separate:

- **`api`** and **`app`** are different runtimes entirely — a Node.js/Express backend and a Vue 3 SPA — that happen to
  ship together but build, test, and deploy independently.
- **`packages/*`** (32 of them) are the shared surface between `api`/`app`/`sdk`/`directus`, split by concern: types,
  utilities, storage drivers (6 separate backends: local, S3, Azure, GCS, Cloudinary, Supabase), the extension framework
  (`extensions`, `extensions-registry`, `extensions-sdk`, `create-directus-extension`), and standalone tooling
  (`release-notes-generator`, `create-directus-project`).
- **`directus`** is a thin published-package wrapper (a `bin` entry point) around `@directus/api`, not application logic
  itself.
- **`sdk`** is a separately-published TypeScript client for consuming the API — genuinely a different audience
  (third-party integrators) than the API/App code itself.
- **`tests/*`** (blackbox, e2e, mock-license-server, sandbox) are their own workspace projects with their own dependency
  graphs, not folders inside `api`/`app`.

## 3. Repository structure

Target layout, verified against the source app (✅ = full source copied and reviewed, 🚧 = source tree partially
started, 📋 = `package.json` migrated but source tree not yet copied):

```text
directus-main/
├── directus/                    ✅ CLI wrapper package (cli.js, version helpers, license, readme)
├── sdk/                         📋 TypeScript SDK — package.json only
├── api/                         📋 Express/Knex backend — package.json only
├── app/                         📋 Vue 3 dashboard — package.json only
├── packages/
│   ├── ai/                      📋
│   ├── composables/             📋
│   ├── constants/                📋
│   ├── create-directus-extension/ 📋
│   ├── create-directus-project/ 📋
│   ├── env/                     📋
│   ├── errors/                  📋
│   ├── extensions/              📋
│   ├── extensions-registry/     📋
│   ├── extensions-sdk/          📋
│   ├── format-title/            📋
│   ├── memory/                  📋
│   ├── pressure/                📋
│   ├── release-notes-generator/ 📋  — see Section 5, "pnpm-internals dependency" note
│   ├── schema/                  📋
│   ├── schema-builder/          📋
│   ├── specs/                   📋
│   ├── storage/                 📋
│   ├── storage-driver-azure/    📋
│   ├── storage-driver-cloudinary/ 📋
│   ├── storage-driver-gcs/      📋
│   ├── storage-driver-local/    📋
│   ├── storage-driver-s3/       📋
│   ├── storage-driver-supabase/ 📋
│   ├── stores/                  📋
│   ├── system-data/             📋
│   ├── themes/                  📋
│   ├── types/                   🚧  43 of ~54 planned files — see todo.md
│   ├── update-check/            📋
│   ├── utils/                   📋
│   ├── validation/              📋
│   └── visual-editing/          📋
├── tests/
│   ├── blackbox/                📋  (+ 2 extension fixtures: action-verify-create, action-verify-schema)
│   ├── e2e/                     📋
│   ├── mock-license-server/     📋
│   └── sandbox/                 📋
├── scripts/
│   └── deploy-production.mjs    ✅  custom replacement for `pnpm deploy` — see Section 6
├── .github/                     ✅  17 workflows, prepare action, CodeQL config, templates
├── Dockerfile, Dockerfile.dhi   ✅  standard + hardened/distroless variants
├── docker-compose.yml           ✅  local dev database/service stack
├── package.json, .yarnrc.yml, yarn.lock  ✅  Yarn workspace root config
└── readme.md, license, AGENTS.md, etc.   ✅  root docs and policy files
```

`workspaces` in the root `package.json` already declares all 6 workspace glob patterns (`directus`, `app`, `api`, `sdk`,
`packages/*`, `tests/*`) — Yarn resolves the whole dependency graph correctly today even with most packages
source-empty, since `yarn install` only needs a valid `package.json` per workspace, not the actual code. Adding real
source files to each 📋 package is purely additive going forward; nothing about the root config needs to change as they
land.

## 4. Services breakdown

- **CLI / entry point**: `directus` — the published `bin`, depends on `@directus/api` and `@directus/update-check` via
  `workspace:*`.
- **Core runtime**: `api` (Express + Knex, REST/GraphQL), `app` (Vue 3 + Vite dashboard), `sdk` (published TypeScript
  client).
- **Extension system**: `extensions` (runtime loader framework), `extensions-registry` (Marketplace registry client),
  `extensions-sdk` + `create-directus-extension` (scaffolding/build tooling for third-party extensions).
- **Storage abstraction**: `storage` (interface) + 6 backend drivers, each an independently swappable implementation.
- **Shared foundation**: `types`, `utils`, `constants`, `errors`, `env`, `schema`, `schema-builder`, `system-data`,
  `validation`, `format-title`, `memory` (Redis/memory abstraction), `pressure` (rate limiting), `themes`, `stores`
  (shared Pinia stores), `visual-editing`, `ai`.
- **Release tooling**: `release-notes-generator` (changeset-driven release notes — currently mid-migration, see Section
  5), `create-directus-project` (scaffolding CLI for new Directus projects), `update-check`.
- **Test projects**: `blackbox` (API integration tests against real DB vendors), `e2e` (Playwright-style end-to-end),
  `mock-license-server`, `sandbox` (spin-up toolkit for test environments).

## 5. Package management and tooling

- **Node 26** (`engines.node: "26"` at root; individual packages use looser `>=22` ranges, matching what's currently
  installed via nvm-windows), **Yarn 4.18.0** (Berry), pinned via `packageManager` and activated through **Corepack**
  (installed explicitly via `npm install -g corepack` — recent Node builds no longer bundle it).
- **`nodeLinker: node-modules`** in `.yarnrc.yml`, not Yarn's PnP default — this repo has real native-binding
  dependencies (`sharp`, `sqlite3`, `oracledb`, `argon2`, `isolated-vm`, `@parcel/watcher`) that need a conventional
  `node_modules` tree.
- **Every dependency version pinned individually** — pnpm's `catalog:` protocol (a shared version table in
  `pnpm-workspace.yaml`, 331 entries) has no Yarn equivalent, so all 673 `catalog:` references across 40 `package.json`
  files were resolved to their concrete pinned version and inlined directly. `workspace:*` references (114 of them)
  needed no change — Yarn Berry supports that protocol natively.
- **`pnpm.overrides` → Yarn `resolutions`** (7 entries) — syntax translated (`"parent>child"` nesting →
  `"parent/child"`), confirmed working via a real `yarn install`.
- **`yarn workspaces foreach`/`focus` and `yarn npm publish`** (used in root scripts, the CI prepare action, and
  `release.yml`) are core Yarn 4.18.0 commands — confirmed via `--help` against the real installed binary, no
  `@yarnpkg/plugin-workspace-tools` import needed (an earlier assumption that it would be required turned out not to
  apply to this Yarn version).
- **`vitest` bumped to `4.1.10`** (latest, from the source repo's pinned `3.2.7`) across all 32 consuming packages, per
  explicit decision to run latest rather than inherit the source pin. **Not yet verified against real config** — no
  package's `vitest.config.ts` has been copied yet, so whether the 3.x→4.x breaking changes affect this repo's actual
  test setup is unconfirmed. Flagged in `todo.md`.
- **No `catalog:` allowlist replacement for pnpm's `onlyBuiltDependencies`.** pnpm's `pnpm-workspace.yaml` restricted
  which packages are allowed to run install/postinstall lifecycle scripts (an 11-package allowlist, default-deny
  otherwise). Yarn Berry has no equivalent scoped allowlist — `.yarnrc.yml` sets `enableScripts: true` (Yarn's
  permissive default), a real security-posture downgrade, documented rather than silently accepted.
- **`packages/release-notes-generator`'s dependency on pnpm internals** (`@pnpm/workspace.find-packages`,
  `@pnpm/workspace.pkgs-graph`, `@pnpm/logger`) — its `package.json` no longer lists them, but its actual source
  (`src/utils/process-packages.ts`) still imports and calls them. That file hasn't been copied yet (see Section 3's 📋
  marker), so the rewrite is scoped but not yet executed — planned replacement: read each workspace's `package.json`
  directly (via `yarn workspaces list --json` plus `fs.readFileSync`) and build the internal dependency graph from
  `workspace:*` references, no package-manager-specific API needed at all.

## 6. Docker and deployment

- **`Dockerfile`** (standard, Alpine-based two-stage build) and **`Dockerfile.dhi`** (hardened/distroless variant,
  recompiles `argon2` from source, ships `pm2` as files since the runtime has no shell to install it) — both updated for
  Corepack/Yarn.
- **`scripts/deploy-production.mjs`** replaces pnpm's `deploy --legacy --prod` command, which has no direct Yarn
  equivalent. It runs `yarn workspaces focus directus --production` inside a disposable `git worktree` checked out from
  `HEAD` (not the live working tree), then assembles `./dist` by copying the worktree's `directus/` package plus its
  pruned `node_modules` together, removing the worktree again in a `finally` block. **Non-destructive, matching pnpm's
  original behavior** — an earlier version ran `focus` directly against the repo's own root `node_modules`, requiring a
  manual `yarn install` afterward on any persistent dev checkout; corrected once it became clear `focus` doesn't need
  the live tree, just a checkout at the right commit. Verified end-to-end: `dist/` built with a working `node_modules`
  (724 entries) and a correct `package.json`.
- **A real Docker build-cache regression, accepted deliberately**: pnpm's `pnpm fetch` can populate its package store
  from _just_ the lockfile, letting Docker cache the dependency-fetch layer before the full source tree is copied in.
  Yarn workspaces need every workspace's `package.json` present to resolve at all, so that optimization has no
  equivalent without fragile wildcard `COPY --parents` tricks — both Dockerfiles now do a single `COPY . .` followed by
  `yarn install`, meaning any source change invalidates the install layer too. Documented, not silently dropped.

## 7. CI

- 17 workflows under `.github/workflows/` — lint/format/test (`check.yml`), blackbox and e2e test suites, CodeQL,
  changeset enforcement, release automation (`release.yml`, `prepare-release.yml`), and repo maintenance (stale-issue/PR
  closers, milestone assignment).
- **`.github/actions/prepare`** — the shared setup composite action every workflow calls into: installs Node via
  `node-version-file: package.json`, bootstraps Corepack, runs `yarn install`, and optionally builds.
- **Repo-identity guards updated**: workflows that gate on `github.repository == '...'` (stale-issue/PR maintenance
  jobs) now check `Terrence721/directus-main` instead of the upstream `directus/directus` — otherwise those jobs would
  silently never fire on this fork.
- **Not yet exercised**: no push/PR has actually triggered these workflows against the new repo. Several reference
  secrets (`CLAUDE_CODE_OAUTH_TOKEN`, `RELEASE_PAT`, `DOCKERHUB_USERNAME`/`PASSWORD`, `SLACK_WEBHOOK_CMS_FREEZE`) that
  aren't configured on `Terrence721/directus-main` yet — workflows depending on them will fail until those are set, or
  until they're scoped down for a fork that isn't running the full upstream release pipeline.

## 8. Where to go next

- Live progress and evidence trail: [todo.md](todo.md)
- Repo: [github.com/Terrence721/directus-main](https://github.com/Terrence721/directus-main)
