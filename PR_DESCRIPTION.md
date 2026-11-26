# Pull Request: test: add comprehensive tests for content and insights deployment routes

## Summary

This PR adds comprehensive Vitest tests for the Content module routes (collection and detail) and ensures the Insights and Deployment modules continue to pass their existing tests.

## Changes

- **Content Collection Route** (`app/src/modules/content/routes/collection.test.ts`): Fixed by mocking the local composable `useCollectionsManager` directly since the component imports from `../composables/use-collections-manager.js` rather than `@directus/composables`. Added tests for:
  - Mounting without crashing
  - Sidebar with collections heading
  - Loading state when fetching collections
  - Empty state when no collections
  - Rendering collections in sidebar
  - Navigation to collection items when sidebar item clicked

- **Content Detail Route** (`app/src/modules/content/routes/detail.test.ts`): Fixed by:
  - Mocking `@directus/composables` resolveApiBaseUrl
  - Mocking vue-router useRoute and useRouter
  - Mocking window.fetch globally
  - Using proper wait conditions for async onMounted fetch calls
  - Added tests for:
    - Mounting without crashing
    - Loading state
    - Error state when 404 fetch fails
    - Rendering detail page header when data is available
    - Go back when back button clicked
    - Delete item when delete button clicked

- **Insights Overview Route** (`app/src/modules/insights/routes/overview.test.ts`): Already passing (unchanged)

- **Deployment Overview Route** (`app/src/modules/deployment/routes/overview.test.ts`): Already passing (unchanged)

- **Items Collection Route** (`app/src/modules/items/routes/collection.test.ts`): Already passing (unchanged)

## Technical Details

- Used `vi.mock()` for local composables: `../composables/use-collections-manager.js` and `../composables/use-navigation.js`
- Used `vi.hoisted()` for shared mock state
- Used `vi.resetModules()` + `vi.clearAllMocks()` in `beforeEach`
- Used `window.fetch` mocking instead of `global.fetch` for happy-dom compatibility
- Used proper async waiting with `new Promise(process.nextTick)` and `await wrapper.vm.$nextTick()` after `flushPromises()`

## Test Results

All 238 tests pass across all modules:

- Content: 12 tests (collection: 6, detail: 6)
- Insights: 6 tests
- Deployment: 5 tests
- Items: 8 tests
- Search: 18 tests
- Users: 18 tests
- Others: various existing tests

## Workflow

Following the established pattern:

- Topic branch off main: `test/insights-deployment-routes`
- Run eslint/prettier/test/typecheck before PR
- Commit with Co-Authored-By trailer
- Push branch
- Open PR into main

Next steps: Merge into main and switch back to main branch.
