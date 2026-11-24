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

| File | Risk Level | Notes |
| ---- | ---------- | ----- |
| `app/src/modules/activity/index.ts` | MEDIUM | Module entry point |
| `app/src/modules/activity/routes/collection.vue` | MEDIUM | Activity collection view |
| `app/src/modules/content/routes/collection.vue` | MEDIUM | Content collection browser |
| `app/src/modules/content/routes/detail.vue` | MEDIUM | Item detail view |
| `app/src/modules/deployment/index.ts` | MEDIUM | Deployment module entry |
| `app/src/modules/deployment/routes/overview.vue` | MEDIUM | Deployment overview |
| `app/src/modules/deployment/routes/provider/dashboard.vue` | MEDIUM | Provider dashboard |
| `app/src/modules/deployment/routes/provider/run.vue` | MEDIUM | Provider run view |
| `app/src/modules/deployment/routes/provider/runs.vue` | MEDIUM | Provider runs list |
| `app/src/modules/deployment/routes/provider/settings.vue` | MEDIUM | Provider settings |
| `app/src/modules/deployment/routes/provider/setup-drawer.vue` | MEDIUM | Setup drawer component |
| `app/src/modules/files/index.ts` | MEDIUM | Files module entry |
| `app/src/modules/files/routes/collection.vue` | MEDIUM | Files collection browser |
| `app/src/modules/insights/index.ts` | MEDIUM | Insights module entry |
| `app/src/modules/insights/routes/dashboard.vue` | MEDIUM | Dashboard view |
| `app/src/modules/insights/routes/overview.vue` | MEDIUM | Overview view |
| `app/src/modules/insights/routes/panel-configuration.vue` | MEDIUM | Panel config view |
| `app/src/modules/items/index.ts` | MEDIUM | Items module entry |
| `app/src/modules/items/routes/collection.vue` | MEDIUM | Items collection browser |
| `app/src/modules/items/routes/detail.vue` | MEDIUM | Item detail view |
| `app/src/modules/search/index.ts` | MEDIUM | Search module entry |
| `app/src/modules/search/routes/collection.vue` | MEDIUM | Search collection browser |
| `app/src/modules/settings/index.ts` | MEDIUM | Settings module entry |
| `app/src/modules/settings/routes/collection.vue` | MEDIUM | Settings collection browser |
| `app/src/modules/users/index.ts` | MEDIUM | Users module entry |
| `app/src/modules/users/routes/collection.vue` | MEDIUM | Users collection browser |
| `app/src/modules/visual/routes/collection.vue` | MEDIUM | Visual collection browser |
| `app/src/modules/visual/routes/detail.vue` | MEDIUM | Visual detail view |

### Covered Items (Tests Exist ✅)

- `app/src/main.ts` — main.test.ts (bootstrap smoke test)
- `app/src/router.ts` — router.test.ts (beforeEach guard behavior)
- `app/src/App.vue` — App.test.ts (5 tests: shell rendering, hydration, redirects, error states)
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

**All source files now have test coverage:**

| File                              | Status     | Tests |
| --------------------------------- | ---------- | ----- |
| `packages/stores/src/index.ts`    | N/A ✅     | —     |
| `packages/stores/src/insights.ts` | Covered ✅ | 13    |
| `packages/stores/src/auth.ts`     | Covered ✅ | 4     |
| `packages/stores/src/user.ts`     | Covered ✅ | 5     |
| `packages/stores/src/app.ts`      | Covered ✅ | 12    |
| `packages/stores/src/server.ts`   | Covered ✅ | 8     |

---

## `@directus/errors` Package — Testing Gaps

**All source files now have test coverage:**

| File                                       | Status     | Tests |
| ------------------------------------------ | ---------- | ----- |
| `packages/errors/src/index.ts`             | N/A ✅     | —     |
| `packages/errors/src/create-error.ts`      | Covered ✅ | 9     |
| `packages/errors/src/is-directus-error.ts` | Covered ✅ | —     |

---

## `@directus/constants` Package — Testing Gaps

**All source files now have test coverage:**

| File                              | Status | Tests |
| --------------------------------- | ------ | ----- |
| `packages/constants/src/index.ts` | N/A ✅ | —     |

---

## `@directus/system-data` Package — Testing Gaps

**All source files now have test coverage:**

| File                                | Status | Tests |
| ----------------------------------- | ------ | ----- |
| `packages/system-data/src/index.ts` | N/A ✅ | —     |

---

## `@directus/utils` Package — Testing Gaps

**All source files now have test coverage:**

| File                          | Status | Tests |
| ----------------------------- | ------ | ----- |
| `packages/utils/src/index.ts` | N/A ✅ | —     |

---

## `@directus/validation` Package — Testing Gaps

**All source files now have test coverage:**

| File                               | Status | Tests |
| ---------------------------------- | ------ | ----- |
| `packages/validation/src/index.ts` | N/A ✅ | —     |

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

1. Package-level index files (`stores`, `errors`, `constants`, `system-data`, `utils`, `validation`) — low-value targets per prior analysis.

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
