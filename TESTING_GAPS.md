# Testing Gaps Analysis

_Last updated: 2026-11-26 — all previously identified gaps closed; detail views, panel configuration, and visual detail reinforced._

## Status: Complete ✅

All route components, composables, module entry points, and error utilities
have corresponding test files. **343 tests passing** across 51 test files
in the app workspace.

## Measured coverage (app workspace, `test:coverage`)

| Metric     | Before | After  |
| ---------- | ------ | ------ |
| Statements | 80.4%  | 95.4%  |
| Branches   | 75.29% | 87.75% |
| Functions  | 65.6%  | 90.78% |
| Lines      | 82.01% | 96.25% |

Three reinforcement passes were applied:

**Pass 1 — collection browsers** (insights/dashboard, visual/collection,
content/collection, items/collection): statement coverage 80.4% → 91.62%.

**Pass 2 — detail views** (content/detail, items/detail) and
**insights/panel-configuration**: statement coverage 91.62% → 95.12%.

**Pass 3 — visual detail** (visual/routes/detail.vue): added error-retry,
route-params watch, and the field-formatting branches (date, position,
array, empty-value).

| File                                    | Stmts | Branch | Funcs |
| --------------------------------------- | ----- | ------ | ----- |
| content/routes/detail.vue               | 98.2% | 83.3%  | 100%  |
| items/routes/detail.vue                 | 97.8% | 93.8%  | 100%  |
| insights/routes/panel-configuration.vue | 98.0% | 90.5%  | 100%  |
| visual/routes/detail.vue                | 96.7% | 96.7%  | 100%  |

Remaining low-coverage spot: `insights/routes/overview.vue` (93.8% stmts).
Branch coverage overall (87.75%) now tracks statement coverage closely.

## Coverage

### Route Components (app/src/modules/**/routes/)

All 15 route views plus 5 nested deployment provider routes are covered:

| Module              | Test Files                                   |
| ------------------- | -------------------------------------------- |
| content             | collection, detail                           |
| items               | collection, detail                           |
| search              | collection                                   |
| users               | collection                                   |
| activity            | collection                                   |
| files               | collection                                   |
| settings            | collection                                   |
| visual              | collection, detail                           |
| insights            | overview, dashboard, panel-configuration     |
| deployment          | overview                                     |
| deployment/provider | dashboard, run, runs, settings, setup-drawer |

### Composables (app/src/modules/**/composables/)

| Composable                      | Test |
| ------------------------------- | ---- |
| content/use-collections-manager | ✅   |
| content/use-navigation          | ✅   |
| visual/use-collections-manager  | ✅   |
| visual/use-navigation           | ✅   |

### Module Entry Points (app/src/modules/*/index.ts)

| Module     | Test |
| ---------- | ---- |
| activity   | ✅   |
| files      | ✅   |
| insights   | ✅   |
| items      | ✅   |
| deployment | ✅   |
| content    | ✅   |
| visual     | ✅   |
| settings   | ✅   |
| search     | ✅   |
| users      | ✅   |

### Packages

| Package               | Notes                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| @directus/utils       | All utility functions tested                                                                    |
| @directus/constants   | auth, permissions tested                                                                        |
| @directus/system-data | collection, field, filter, permission, relation, translation tested                             |
| @directus/stores      | app, server, user, auth, insights tested                                                        |
| @directus/validation  | is-email, is-password, validate-register tested                                                 |
| @directus/errors      | create-error, is-directus-error, forbidden, invalid-credentials, not-found, unauthorized tested |
| @directus/composables | All composables tested                                                                          |

## Pattern for new tests

1. `vi.mock()` composables and vue-router at top level (mock local module
   composables by their exact import specifier — content/visual modules import
   them relative, e.g. `../composables/use-collections-manager`)
2. `window.fetch = vi.fn()` for global fetch mocking; reset in `beforeEach`.
   Prefer a URL-based mock that switches on the request path
   (`url.includes('/collections/')` vs `/items/`) over
   `mockResolvedValueOnce` queues — queues are order-fragile whenever a
   test re-triggers fetches (retry, pagination) and the queue empties
3. `beforeEach`: `vi.resetModules()`, `vi.clearAllMocks()`, `setActivePinia()`,
   reset module-level mock refs
4. `afterEach`: `vi.unstubAllGlobals()`
5. Async import: `await import('./component.vue')` per test
6. Drive component state through module-level mock refs (setup-scope refs are
   auto-unwrapped on `wrapper.vm`, so `.value` assignment does not work)
7. `await wrapper.vm.$nextTick()` after state changes; `flushPromises()` or
   `new Promise(process.nextTick)` after fetch chains
8. Test mounting, loading states, error states, and user interactions

## Known issue (pre-existing, environment)

`yarn workspace @directus/<pkg> test` fails at `describe` collection for all
package workspaces — a broken nested `packages/*/node_modules` copy of vitest
(verified pre-existing on clean main). The root vitest install works:
`node ../../node_modules/vitest/vitest.mjs run` from inside the package.
