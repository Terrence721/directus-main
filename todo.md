# 📝 TODO

**Last Updated:** September 4, 2026 (repo started from scratch — root `package.json` added, nothing else yet)

A phase-by-phase log of what's been done on this repo and what's still open. This is the source of truth for
progress — a GitHub Project board (once set up) will be a lighter-weight view of the same work, kept in sync with
this file, not a separate source of truth.

**What this repo is:** a personal demonstration workspace, not a fork or continuation of the real
[Directus](https://github.com/directus/directus) project. It's built one file at a time — adding real source where
fidelity to a battle-tested implementation matters, and deliberately redesigning specific pieces where the goal is a
different, defensible architectural call, each deviation disclosed explicitly when it happens. Node.js, Vue 3, and
Yarn throughout.

## At a glance

**Done, in full:**

| Item           | Detail                                                                                                                                                          | Phase   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Repo bootstrap  | Root `package.json` added — Yarn workspace declaration (`directus`, `app`, `api`, `sdk`, `packages/*`, `tests/*`), `packageManager`/`engines` pinned. Scripts/devDependencies deliberately deferred until `.yarnrc.yml`'s catalog exists | Phase 1 |

**Actually still open, right now:** essentially everything — `.yarnrc.yml` catalog, root `.gitignore`, `scripts`/`devDependencies` on `package.json` once the catalog exists, CI, and every real package source tree. See the **Still to do** table below.

## ✅ Done

### Repository bootstrap

| Phase | Commit | Date       | What                                                                                                                                                                                                            |
| ----- | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | —      | 2026-09-04 | Root `package.json` added: `directus-monorepo`, `private: true`, Yarn workspace glob (6 patterns), `packageManager: yarn@4.18.0` (verified current against Yarn Berry's own GitHub releases, not the stale `yarn` npm package), `engines.node: 26`. No `scripts`/`devDependencies` yet — every one of upstream's real root scripts needs either a tool that isn't installed yet or a `catalog:` reference to a file (`.yarnrc.yml`) that doesn't exist yet; adding them now would just be dead/broken config |

## 🚧 Still to do

| Item                              | Detail                                                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `.yarnrc.yml` catalog              | Shared dependency versions for the whole workspace, checked against real npm latest as they're added — not copied from any other repo unverified |
| Root `package.json` completion     | Real `scripts` (`build`/`lint`/`format`/`test`/etc.) and `devDependencies`, once the catalog exists to back `catalog:` references                |
| Root `.gitignore`                  | `node_modules`, `dist`, `.yarn/cache`, and this repo's own local-only files (`cspell.json`, `*.code-workspace`)                                    |
| CI (GitHub Actions)                | Lint/format/build/test workflow, CodeQL                                                                                                        |
| GitHub Project board               | Scrum-style Backlog/Planned/In Progress/Verification & QA/Done, matching this author's other portfolio repos                                     |
| Real source, package by package    | Starting with foundational shared packages (the ones with the widest fan-in), Vue-ecosystem packages prioritized once their dependencies exist   |
