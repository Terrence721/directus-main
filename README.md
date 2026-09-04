**[→ Read the one-page portfolio](https://terrence721.github.io/directus-main/portfolio.html)** — the 60-second version, with links back into this repo for anyone who wants to go deeper.

# ⚙️ Principal Frontend Engineering Demonstration (Vue/Node.js/Yarn)

[![CI](https://github.com/Terrence721/directus-main/actions/workflows/ci.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Terrence721/directus-main/actions/workflows/codeql.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/codeql.yml)

Last updated: September 4, 2026

This repository is a personal demonstration workspace: a Node.js/Vue 3/Yarn monorepo built one file at a time, taking the real, battle-tested Directus project as a reference point rather than a source to reproduce. Where the goal is a defensible, different architectural call, this repo redesigns instead of copying — that's the default, not the exception.

This repo is **not affiliated with, and not published by, the upstream Directus project or Monospace Inc.** It is MIT-licensed; see [LICENSE](./LICENSE).

## 🧭 Start Here

- **[`todo.md`](todo.md)** — the phase-by-phase log of everything done and everything still open. This is the source of truth for progress.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/6)** — a lighter-weight, at-a-glance view of the same work, kept in sync with `todo.md`.
- **[Wiki](https://github.com/Terrence721/directus-main/wiki)** — short pointers into specific decisions, one page per package.

On AI-assisted development: commits co-authored as Claude are AI-assisted implementations directed, reviewed, and merged by Terrence Daniels — same process as every other change.

## 🏗 What's Here So Far

`packages/stores` is done: four Pinia stores (`useAuthStore`, `useUserStore`, `useServerStore`, `useAppStore`), 20 tests, 100% coverage. `packages/constants` is in progress. Root scaffolding (Yarn Berry workspace, CI, lint/format tooling) is complete. See `todo.md` for the exact commit-by-commit breakdown.

Vue-ecosystem packages are prioritized next, following the real dependency graph rather than name-based guessing.
