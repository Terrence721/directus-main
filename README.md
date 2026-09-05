**[→ Read the one-page portfolio](https://terrence721.github.io/directus-main/portfolio.html)** — the 60-second version, with links back into this repo for anyone who wants to go deeper.

# ⚙️ Principal Frontend Engineering Demonstration (Vue/Node.js/Yarn)

[![CI](https://github.com/Terrence721/directus-main/actions/workflows/ci.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Terrence721/directus-main/actions/workflows/codeql.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/codeql.yml)

Last updated: September 5, 2026

This repository is a personal demonstration workspace: a Node.js/Vue 3/Yarn monorepo built one file at a time, taking the real, battle-tested Directus project as a reference point rather than a source to reproduce. Where the goal is a defensible, different architectural call, this repo redesigns instead of copying — that's the default, not the exception.

This repo is **not affiliated with, and not published by, the upstream Directus project or Monospace Inc.** It is MIT-licensed; see [LICENSE](./LICENSE).

## 🚀 Try it live

**[terrence721.github.io/directus-main/app](https://terrence721.github.io/directus-main/app/)** — a real, deployed Vue app: routed login/home pages, a working (simulated) auth flow, and a logout button. Try `demo@directus-main.dev` / `demo1234`, or anything else to see the real error path.

## 🧭 Start Here

- **[System Architecture](https://terrence721.github.io/directus-main/diagrams/system-architecture.html)** — the real workspace dependency graph, and the CI-ordering bug that came out of it
- **[Auth & Request Flow](https://terrence721.github.io/directus-main/diagrams/auth-flow.html)** — login, the route guard's two directions, and the test-isolation bug one of them exposed
- **[Data Model](https://terrence721.github.io/directus-main/diagrams/data-model.html)** — the Pinia store shapes and `DirectusError` hierarchy, and the two independent-refs bugs prevented by design
- **[Testing Strategy](https://terrence721.github.io/directus-main/diagrams/testing-strategy.html)** — the four-package test-layer stack, and what 100% coverage still let through
- **[`todo.md`](todo.md)** — the phase-by-phase log of everything done and everything still open. This is the source of truth for progress.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/6)** — a lighter-weight, at-a-glance view of the same work, kept in sync with `todo.md`.
- **[Wiki](https://github.com/Terrence721/directus-main/wiki)** — short pointers into specific decisions, one page per package.

This repository was built through AI-assisted development (Claude), directed, reviewed, and merged by Terrence Daniels at every step — disclosed here rather than per-commit, since this repo's commit history doesn't carry co-author trailers.

## 🏗 What's Here So Far

Three packages done: `packages/stores` (four Pinia stores, 20 tests, 100% coverage), `packages/constants` (RBAC/auth vocabulary), and `packages/errors` (a real `DirectusError` class hierarchy — `ForbiddenError`, `InvalidCredentialsError`). `app/` is a real, deployed Vue app — routed (`vue-router`), styled, with a working login/logout flow against a simulated `authClient`. Root scaffolding (Yarn Berry workspace, CI, lint/format tooling) is complete. See `todo.md` for the exact commit-by-commit breakdown.

Next: more of the real ~28-package target, plus session persistence and a real API client for `app/`.
