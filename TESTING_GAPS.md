# Testing Gaps Analysis

_Last updated: 2026-11-26 — all previously identified gaps are now closed._

## Status: Complete ✅

All route components, composables, module entry points, and error utilities
have corresponding test files. **311 tests passing** across 51 test files
in the app workspace.

## Coverage

### Route Components (app/src/modules/**/routes/)

All 15 route views plus 5 nested deployment provider routes are covered:

| Module | Test Files |
| --- | --- |
| content | collection, detail |
| items | collection, detail |
| search | collection |
| users | collection |
| activity | collection |
| files | collection |
| settings | collection |
| visual | collection, detail |
| insights | overview, dashboard, panel-configuration |
| deployment | overview |
| deployment/provider | dashboard, run, runs, settings, setup-drawer |

### Composables (app/src/modules/**/composables/)

| Composable | Test |
| --- | --- |
| content/use-collections-manager | ✅ |
| content/use-navigation | ✅ |
| visual/use-collections-manager | ✅ |
| visual/use-navigation | ✅ |

### Module Entry Points (app/src/modules/*/index.ts)

| Module | Test |
| --- | --- |
| activity | ✅ |
| files | ✅ |
| insights | ✅ |
| items | ✅ |
| deployment | ✅ |
| content | ✅ |
| visual | ✅ |
| settings | ✅ |
| search | ✅ |
| users | ✅ |

### Packages

| Package | Notes |
| --- | --- |
| @directus/utils | All utility functions tested |
| @directus/constants | auth, permissions tested |
| @directus/system-data | collection, field, filter, permission, relation, translation tested |
| @directus/stores | app, server, user, auth, insights tested |
| @directus/validation | is-email, is-password, validate-register tested |
| @directus/errors | create-error, is-directus-error, forbidden, invalid-credentials, not-found, unauthorized tested |
| @directus/composables | All composables tested |

## Pattern for new tests

1. `vi.mock()` composables and vue-router at top level (mock local module
   composables by their exact import specifier — content/visual modules import
   them relative, e.g. `../composables/use-collections-manager`)
2. `window.fetch = vi.fn()` for global fetch mocking; reset in `beforeEach`
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
