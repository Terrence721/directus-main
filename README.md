# 🔷 Directus, Redesigned

[![CI](https://github.com/Terrence721/directus-main/actions/workflows/ci.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Terrence721/directus-main/actions/workflows/codeql.yml/badge.svg)](https://github.com/Terrence721/directus-main/actions/workflows/codeql.yml)

Last updated: September 4, 2026

This repository is a personal demonstration workspace: a Node.js/Vue 3/Yarn monorepo built one file at a time, taking the real, battle-tested [Directus](https://github.com/directus/directus) project as a reference point rather than a source to reproduce. Where the goal is a defensible, different architectural call, this repo redesigns instead of copying — that's the default, not the exception.

This repo is **not affiliated with, and not published by, the upstream Directus project or Monospace Inc.** It is MIT-licensed; see [LICENSE](./LICENSE).

## 🧭 Start Here

- **[`todo.md`](todo.md)** — the phase-by-phase log of everything done and everything still open. This is the source of truth for progress.
- **[GitHub Project board](https://github.com/users/Terrence721/projects/6)** — a lighter-weight, at-a-glance view of the same work, kept in sync with `todo.md`.

On AI-assisted development: commits co-authored as Claude are AI-assisted implementations directed, reviewed, and merged by Terrence Daniels — same process as every other change.

## 🏗 What's Here So Far

Root scaffolding only, so far: a Yarn Berry workspace (`directus`, `app`, `api`, `sdk`, `packages/*`, `tests/*` — none populated yet), CI (lint/format/build/test plus CodeQL), and the lint/format tooling backing it. See `todo.md` for the exact commit-by-commit breakdown.

Real package source is next, starting with the foundational shared packages and prioritizing the Vue-ecosystem pieces.
