![Directus](https://github.com/user-attachments/assets/2e60d36e-079b-4ad1-a246-bcbc000d1700)

# 🗄️ Directus — The Collaborative Backend for Builders & AI

[![Check](https://github.com/Terrence721/directus-main/actions/workflows/check.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/check.yml)
[![CodeQL](https://github.com/Terrence721/directus-main/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/codeql-analysis.yml)

**[📜 View the portfolio page →](https://terrence721.github.io/directus-main/portfolio.html)**

Last updated: August 20, 2026 (40/40 manifests migrated · 2 of 40 packages have real source — `directus` complete but
not yet runnable, `types` 43 of ~54 files · 5 real gaps found and fixed, 1 tracked openly)

This is an independently maintained port of [Directus's own monorepo](https://github.com/directus/directus) — a
real-time API/App dashboard that wraps any SQL database with REST and GraphQL APIs and a visual management Studio —
migrated from pnpm to Yarn and rebuilt **one package at a time**, each file evaluated and upgraded against what's
actually current rather than copied over wholesale.

Not a fork left as-is. Every pnpm-specific mechanism Yarn has no exact equivalent for got a real decision, tested
against a real install — two of those first-pass decisions were wrong and got corrected properly rather than left
standing. Two more real gaps turned up in Directus's own published source and tooling. All five are disclosed, not
smoothed over — see the
**[Yarn Migration diagram](https://terrence721.github.io/directus-main/diagrams/yarn-migration.html)**.

**At a glance:** 40/40 workspace manifests migrated, `packages/types` at 43 of ~54 planned files (added one file per
commit, each diffed byte-for-byte against upstream before landing), five real gaps found and fixed, and this repo's own
status kept honest across five public surfaces — `todo.md`, `architect.md`, the profile README, the portfolio site, and
the wiki — with a full drift sweep run periodically rather than assumed still accurate.

## 🧭 Start Here

- **[System Architecture](https://terrence721.github.io/directus-main/diagrams/system-architecture.html)** — the
  four-layer dependency shape (foundation → CLI → runtimes → tests) and exactly what's real today
- **[Yarn Migration](https://terrence721.github.io/directus-main/diagrams/yarn-migration.html)** — the six pnpm
  mechanisms with no exact Yarn equivalent, five real gaps found and fixed, one still open
- **[Package Manifests](https://terrence721.github.io/directus-main/diagrams/package-manifests.html)** — all 40
  workspace packages, grouped by role, each with a real one-line description
- **[Known Gaps](https://terrence721.github.io/directus-main/diagrams/known-gaps.html)** — CI, testing, and Docker gaps,
  stated plainly rather than buried in a table

The [wiki](https://github.com/Terrence721/directus-main/wiki) goes deeper per completed piece of work, each page linking
back to the real source rather than repeating it.

- **[`todo.md`](todo.md)** — the evidence-backed log of everything done and everything still open, with commit hashes.
  This is the source of truth for progress.
- **[`architect.md`](architect.md)** — how this repo is put together and why, verified against the real source rather
  than described generically.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/6)** — a Scrum-style Backlog/In Progress/Done
  view of the same work, kept in sync with [`todo.md`](todo.md).
- **[`portfolio.html`](https://terrence721.github.io/directus-main/portfolio.html)** — this repo as a portfolio piece:
  real gaps found, real corrections made, and why, for anyone scanning it rather than reading it as documentation.
- **[`contributing.md`](contributing.md)** — development setup and contribution principles.

## 🧭 Why This Matters

Moving a large monorepo off pnpm is a genuinely common, genuinely underrated engineering task — the kind of work that
shows up in real migrations far more often than greenfield builds do. Directus's own monorepo (40 workspace packages, a
331-entry shared version catalog, 17 CI workflows, two Dockerfiles) made a useful subject precisely because pnpm has
mechanisms Yarn has no exact equivalent for: `catalog:`, `pnpm.overrides`, a regex script-filter, `pnpm deploy`,
`pnpm fetch`'s layer-caching, and an `onlyBuiltDependencies` allowlist. Each one needed a real decision, verified
against a real install or a real compiler run — not assumed correct because it looked reasonable.

## 🏗 What's Here So Far

Every workspace's `package.json` (40 of them) is migrated — `yarn install` resolves the full dependency graph today.
`directus` (the CLI wrapper) has a complete source tree, though not yet a runnable one: `cli.js` imports
`@directus/update-check` and dynamically imports `@directus/api/cli/run.js`, both still manifest-only. `packages/types`
is 43 of ~54 planned files, added one file per commit and diffed byte-for-byte against upstream before landing. The
other 38 workspace packages exist on disk as manifests only. See [`todo.md`](todo.md) for the full build-out plan and
the honest current state.

```text
  packages/types/          shared TypeScript types                        🚧 43 of ~54 files
  directus/                CLI wrapper (bin)                              ✅ source done, not yet runnable
  packages/ (31 others)    constants, schema, utils, storage drivers…     ⬜ manifest only
  sdk/                     TypeScript client for integrators              ⬜ manifest only
  api/                     Express/Knex backend                           ⬜ manifest only
  app/                     Vue 3 Studio                                   ⬜ manifest only
  tests/                   blackbox (+2 fixtures), e2e, mock-license…     ⬜ manifest only
```

## 🖥 Getting Started

**Not runnable end-to-end yet** — `directus`'s own CLI can't execute until `@directus/api` and `@directus/update-check`
have real source, and `api`/`app` are still manifests. See [`todo.md`](todo.md) for the honest current state. What
follows is prerequisite setup, useful today regardless of how much of the app exists.

- Clone this repository: `https://github.com/Terrence721/directus-main`
- Install [Node.js 26](https://nodejs.org/) (pinned in `package.json`'s `engines.node`) — Corepack isn't bundled in this
  Node build, confirmed locally, so run `npm install -g corepack` first, then `corepack enable` for Yarn 4.18.0
- [Install & start Docker Desktop](https://docs.docker.com/engine/install/) — `docker-compose.yml` brings up every
  supported database backend (Postgres, MySQL, MariaDB, MSSQL, Oracle, CockroachDB) plus Redis and MinIO for the
  eventual test matrix

### Installing dependencies

```powershell
yarn install
```

Resolves the complete 43-manifest dependency graph today, even though most packages are source-empty — adding real
source to each one is purely additive from here.

### Building what exists today

```powershell
yarn build
```

Scoped to `--include directus` in the root script — the only workspace with a build script and real source right now.
That scope grows by name as each package lands real source, not all at once.

## Contributing

For more information on contributing to this repo, read [the contribution documentation](contributing.md) and
[the Code of Conduct](code_of_conduct.md).

## 📄 License

Licensed under the Monospace Sustainable Core License (MSCL) 1.0 — see [`license`](license) for the full text.

**Free for most builders.** Organizations under $5M in annual revenue and 50 employees can use it for free.

**Free Core Tier.** A free tier is available to everyone to explore and build on without a commercial license.

**Commercial License.** Organizations above those thresholds using advanced or enterprise features require a commercial
license.

## Acknowledgment

Built from [Directus's](https://github.com/directus/directus) own monorepo, copyright Monospace Inc. — kept as-is in
[`directus/license`](directus/license) rather than reattributed. For the original, upstream-maintained version, see the
source repo directly.
