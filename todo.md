# 📝 TODO

**Last Updated:** September 4, 2026 (root scaffolding complete — `package.json`, `.yarnrc.yml`, `.gitignore` all in place, `yarn install` resolves cleanly)

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

| Item | Detail | Phase |
| --- | --- | --- |
| Repo bootstrap | Root `package.json`, `.yarnrc.yml` catalog, and `.gitignore` all in place. `yarn install` resolves clean, no errors or warnings | Phase 1 |

**Actually still open, right now:** CI, a GitHub Project board, and every real package source tree. See the **Still to do** table below.

## ✅ Done

### Repository bootstrap

| Phase | Commit | Date | What |
| --- | --- | --- | --- |
| 1 | `904ea51` | 2026-09-04 | Root `package.json` added: `directus-monorepo`, `private: true`, Yarn workspace glob (6 patterns), `packageManager: yarn@4.18.0` (verified current against Yarn Berry's own GitHub releases, not the stale `yarn` npm package), `engines.node: 26`. No `scripts`/`devDependencies` yet — every real root script needed either a tool not installed yet or a `catalog:` reference to a file that didn't exist yet |
| 1 | `232084d` | 2026-09-04 | `todo.md` ledger added, structured after this author's `platform-main` repo |
| 1 | `341a25c` | 2026-09-04 | `.yarnrc.yml` catalog added — shared dependency versions for the whole workspace, each checked against real npm latest at time of writing |
| 1 | `439da97` | 2026-09-04 | Root `.gitignore` added (`node_modules/`, `dist/`, the local Yarn install-state, and machine-local files `cspell.json`/`*.code-workspace`). `package.json` `scripts`/`devDependencies` filled in against the catalog. First real `yarn install` run, and every issue it surfaced fixed: `typescript` pinned to `6.0.3` instead of the just-released `7.0.2`, since `typescript-eslint@8.69.0` (current latest) declares a peer range of `typescript >=4.8.4 <6.1.0` and doesn't support the new TS 7 major yet; three undeclared peer dependencies added (`postcss`, `stylelint-config-html`, `stylelint-config-recommended`) that the Vue/HTML stylelint configs need but don't list as direct deps; `@changesets/cli`, `eslint`, and `stylelint` each fell back one version because the literal latest was still inside npm's publish quarantine window at write time. `yarn.lock` committed |

## 🚧 Still to do

| Item | Detail |
| --- | --- |
| CI (GitHub Actions) | Lint/format/build/test workflow, CodeQL |
| GitHub Project board | Scrum-style Backlog/Planned/In Progress/Verification & QA/Done, matching this author's other portfolio repos |
| Real source, package by package | Starting with foundational shared packages (the ones with the widest fan-in), Vue-ecosystem packages prioritized once their dependencies exist |
