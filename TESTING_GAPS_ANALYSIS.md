# Testing Gap Analysis — directus-main Repository

Generated from analysis of all source files vs. corresponding test files.

## Summary

- **76 test files** exist across the repository (+12 new since baseline).
- Many core packages are well-covered (stores, errors, constants, utils, validation, system-data, API routes).
- **All `@directus/composables` source files now have tests** (14/14 covered).
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

### Covered App Module Composables

| File                                                             | Tests |
| ---------------------------------------------------------------- | ----- |
| `app/src/modules/content/composables/use-collections-manager.ts` | 8     |
| `app/src/modules/visual/composables/use-collections-manager.ts`  | 8     |
| `app/src/modules/visual/composables/use-navigation.ts`           | 6     |

---

## `@directus/composables` Package — Testing Gaps

**All 14 source files now have test coverage:**

| File                                                  | Status     | Tests |
| ----------------------------------------------------- | ---------- | ----- |
| `packages/composables/src/useRouter.ts`               | Covered ✅ | 5     |
| `packages/composables/src/serverClient.ts`            | Covered ✅ | 5     |
| `packages/composables/src/useSessionSync.ts`          | Covered ✅ | 6     |
| `packages/composables/src/useServer.ts`               | Covered ✅ | 5     |
| `packages/composables/src/useFileUpload.ts`           | Covered ✅ | 14    |
| `packages/composables/src/useItems.ts`                | Covered ✅ | 8     |
| `packages/composables/src/useUsers.ts`                | Covered ✅ | 8     |
| `packages/composables/src/useActivity.ts`             | Covered ✅ | 12    |
| `packages/composables/src/useCollections.ts`          | Covered ✅ | 8     |
| `packages/composables/src/useSearch.ts`               | Covered ✅ | 17    |
| `packages/composables/src/useDeploymentNavigation.ts` | Covered ✅ | 3     |
| `packages/composables/src/registerClient.ts`          | Covered ✅ | 7     |
| `packages/composables/src/index.ts`                   | N/A ✅     | —     |
| `packages/composables/src/useAuth.ts`                 | Covered ✅ | 1     |

Total: **99 tests** across 13 test files (index.ts is a barrel export, no tests needed).

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

### Covered API Routes (Tests Exist ✅)

- `api/src/routes/demo-data.ts` — demo-data.test.ts (13 tests)
- `api/src/routes/search.ts` — search.test.ts (13 tests)
- `api/src/routes/activity.ts` — activity.test.ts (13 tests)

### Still Untested

| File |
| ---- |

---

## Recommended Priority Order

1. `app/src/components/ItemsFinder.vue` — LOW risk UI component (optional)
2. `app/src/components/ColumnPicker.vue` — LOW risk UI component (optional)
3. Package-level index files (`stores`, `errors`, `constants`, `system-data`, `utils`, `validation`) — low-value targets per prior analysis.

---

## Well-Covered Areas (Tests Exist ✅)

- App views: HomePage, LoginPage, RegisterPage
- App components: LoginForm, RegisterForm
- App: App.vue, hydrate.ts, sessionPersistence.ts
- App modules: defineModule, routerPass, routing, modules/index
- Router: router.test.ts (beforeEach guard behavior)
- Composables: useAuth.test.ts, authClient.test.ts, useRouter.test.ts, useSessionSync.test.ts, useServer.test.ts, useFileUpload.test.ts, useItems.test.ts, useUsers.test.ts, useActivity.test.ts, useCollections.test.ts, useSearch.test.ts, useDeploymentNavigation.test.ts, registerClient.test.ts
- App modules: app/src/modules/content/composables/use-collections-manager.test.ts (8 tests), app/src/modules/visual/composables/use-collections-manager.test.ts (8 tests), app/src/modules/visual/composables/use-navigation.test.ts (6 tests)
- Stores: auth, user, server, app
- Errors: forbidden, invalid-credentials, not-found, unauthorized
- Constants: auth, permissions
- System-data: collection, field, filter, permission, relation, translation
- Utils: all 11 utility source files + index
- Validation: validate-register, is-email, is-password
- API routes: auth, server, collections, items, users, files, demo-data, search
- API middleware, API index
