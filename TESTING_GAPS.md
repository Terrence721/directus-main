# Testing Gaps Analysis

## Missing Test Files (Routes/Components without corresponding .test.ts files)

### Deployment Module

- `app/src/modules/deployment/routes/provider/dashboard.test.ts`
- `app/src/modules/deployment/routes/provider/run.test.ts`
- `app/src/modules/deployment/routes/provider/runs.test.ts`
- `app/src/modules/deployment/routes/provider/settings.test.ts`
- `app/src/modules/deployment/routes/provider/setup-drawer.test.ts`

### Insights Module

- `app/src/modules/insights/routes/panel-configuration.test.ts`

### Settings Module

- `app/src/modules/settings/routes/collection.test.ts`

### Visual Module

- `app/src/modules/visual/routes/collection.test.ts`
- `app/src/modules/visual/routes/detail.test.ts`

## Summary

- **Total missing test files**: 11
- **All coverage**: 238 tests currently passing
- **Next steps**: Create comprehensive tests for the above missing routes using established patterns

## Pattern to follow for new tests:

1. `vi.mock()` composables and vue-router at top level
2. `window.fetch = vi.fn()` for global fetch mocking
3. `beforeEach`: `vi.resetModules()`, `vi.clearAllMocks()`, `setActivePinia()`, clear mocks
4. `afterEach`: `vi.unstubAllGlobals()`
5. Async imports with `await import('./component.vue')`
6. Proper async waiting for `onMounted` fetch completion
7. Use `flushPromises()` and `await wrapper.vm.$nextTick()` for state updates
8. Test mounting, loading states, error states, and user interactions

---

## Created: Deployment Overview Test

✅ `app/src/modules/deployment/routes/overview.test.ts` - 5 tests passing

## To be created next:

1. Deployment provider routes (dashboard, run, runs, settings, setup-drawer)
2. Insights panel-configuration
3. Settings collection
4. Visual collection & detail
