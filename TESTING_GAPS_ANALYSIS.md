# Testing Gap Analysis — directus-main Repository

Generated from analysis of all source files vs. corresponding test files.

## Summary

- **64 test files** exist across the repository (+3 new).
- Many core packages are well-covered (stores, errors, constants, utils, validation, system-data, API routes).
- **Critical gaps remain** in `@directus/composables` (8 of 14 source files untested after recent coverage additions).
- Covered HIGH-risk items: `app/src/main.ts`, `app/src/router.ts`, `packages/composables/src/authClient.ts`.

---

## App Layer — Testing Gaps

These files directly affect app behavior and were recently modified (bug fixes for auto-login and login hang).

### Untested Source Files

| File                                  | Risk Level | Notes        |
| ------------------------------------- | ---------- | ------------ |
| `app/src/components/ItemsFinder.vue`  | LOW        | UI component |
| `app/src/components/ColumnPicker.vue` | LOW        | UI component |

### Covered Items (Tests Exist ✅)

- `app/src/main.ts` — main.test.ts (bootstrap smoke test)
- `app/src/router.ts` — router.test.ts (beforeEach guard behavior)
- `app/src/components/CollectionSelector.vue` — CollectionSelector.test.ts (5 tests)
- `app/src/components/ColumnPicker.vue` — ColumnPicker.test.ts (5 tests)
- `app/src/components/ItemsFinder.vue` — ItemsFinder.test.ts (3 tests)

### Untested App Module Composables

| File                                                             |
| ---------------------------------------------------------------- |
| `app/src/modules/content/composables/use-collections-manager.ts` |
| `app/src/modules/visual/composables/use-collections-manager.ts`  |
| `app/src/modules/visual/composables/use-navigation.ts`           |

---

## `@directus/composables` Package — Testing Gaps

Only `useAuth.ts` and `authClient.ts` have tests. **11 of 14 source files are untested:**

| File                                                  | Status     |
| ----------------------------------------------------- | ---------- |
| `packages/composables/src/useRouter.ts`               | Covered ✅ |
| `packages/composables/src/serverClient.ts`            | Covered ✅ |
| `packages/composables/src/useSessionSync.ts`          | Covered ✅ |
| `packages/composables/src/useServer.ts`               | Covered ✅ |
| `packages/composables/src/useFileUpload.ts`           | Covered ✅ |
| `packages/composables/src/useItems.ts`                | Covered ✅ |
| `packages/composables/src/useUsers.ts`                | Covered ✅ |
| `packages/composables/src/useActivity.ts`             | Untested   |
| `packages/composables/src/useCollections.ts`          | Untested   |
| `packages/composables/src/useSearch.ts`               | Untested   |
| `packages/composables/src/useDeploymentNavigation.ts` | Untested   |
| `packages/composables/src/registerClient.ts`          | Untested   |
| `packages/composables/src/index.ts`                   | Untested   |

**Highest priority now:** `packages/composables/src/useActivity.ts` — Activity logging endpoints used throughout app. Next: `packages/composables/src/useCollections.ts` for collection data management.

---

## `@directus/stores` Package — Testing Gaps

| File                              |
| --------------------------------- |
| `packages/stores/src/index.ts`    |
| `packages/stores/src/insights.ts` |

---

## `@directus/errors` Package — Testing Gaps

| File                                       |
| ------------------------------------------ |
| `packages/errors/src/create-error.ts`      |
| `packages/errors/src/is-directus-error.ts` |
| `packages/errors/src/index.ts`             |

---

## `@directus/constants` Package — Testing Gaps

| File                              |
| --------------------------------- |
| `packages/constants/src/index.ts` |

---

## `@directus/system-data` Package — Testing Gaps

| File                                |
| ----------------------------------- |
| `packages/system-data/src/index.ts` |

---

## `@directus/utils` Package — Testing Gaps

| File                          |
| ----------------------------- |
| `packages/utils/src/index.ts` |

---

## `@directus/validation` Package — Testing Gaps

| File                               |
| ---------------------------------- |
| `packages/validation/src/index.ts` |

---

## API Layer — Testing Gaps

### Covered Items (Tests Exist ✅)

- `api/src/routes/demo-data.ts` — demo-data.test.ts (13 tests)
- `api/src/routes/search.ts` — search.test.ts (13 tests)

### Still Untested

| File                         |
| ---------------------------- |
| `api/src/routes/activity.ts` |

---

## Recommended Priority Order

1. **`packages/composables/src/useUsers.ts`** — User profile and management composable.
2. **`packages/composables/src/useActivity.ts`** — Activity logging endpoints.
3. **`packages/composables/src/useCollections.ts`** — Collections data composable.

---

## Well-Covered Areas (Tests Exist ✅)

- App views: HomePage, LoginPage, RegisterPage
- App components: LoginForm, RegisterForm
- App: App.vue, hydrate.ts, sessionPersistence.ts
- App modules: defineModule, routerPass, routing, modules/index
- Router: router.test.ts (beforeEach guard behavior)
- Composables: useAuth.test.ts, authClient.test.ts, useRouter.test.ts, useSessionSync.test.ts, useServer.test.ts, useFileUpload.test.ts, useItems.test.ts, useUsers.test.ts
- Stores: auth, user, server, app
- Errors: forbidden, invalid-credentials, not-found, unauthorized
- Constants: auth, permissions
- System-data: collection, field, filter, permission, relation, translation
- Utils: all 11 utility source files + index
- Validation: validate-register, is-email, is-password
- API routes: auth, server, collections, items, users, files, demo-data, search, activity
- API middleware, API index
