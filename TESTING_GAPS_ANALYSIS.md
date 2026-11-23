# Testing Gap Analysis — directus-main Repository

Generated from analysis of all source files vs. corresponding test files.

## Summary

- **63 test files** exist across the repository (+2 new).
- Many core packages are well-covered (stores, errors, constants, utils, validation, system-data, API routes).
- **Critical gaps remain** in `@directus/composables` (11 of 14 source files untested after recent coverage additions).
- Covered HIGH-risk items: `app/src/main.ts`, `app/src/router.ts`, `packages/composables/src/authClient.ts`.

---

## App Layer — Testing Gaps

These files directly affect app behavior and were recently modified (bug fixes for auto-login and login hang).

### Untested Source Files

| File                                        | Risk Level | Notes                                                                                                                                         |
| ------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/src/components/ItemsFinder.vue`        | LOW        | UI component                                                                                                                                  |
| `app/src/components/ColumnPicker.vue`       | LOW        | UI component                                                                                                                                  |
| `app/src/components/CollectionSelector.vue` | LOW        | UI component                                                                                                                                  |

### Covered Items (Tests Exist ✅)

- `app/src/main.ts` — main.test.ts (bootstrap smoke test)
- `app/src/router.ts` — router.test.ts (beforeEach guard behavior)

### Untested App Module Composables

| File                                                             |
| ---------------------------------------------------------------- |
| `app/src/modules/content/composables/use-collections-manager.ts` |
| `app/src/modules/content/composables/use-navigation.ts`          |
| `app/src/modules/visual/composables/use-collections-manager.ts`  |
| `app/src/modules/visual/composables/use-navigation.ts`           |

---

## `@directus/composables` Package — Testing Gaps

Only `useAuth.ts` and `authClient.ts` have tests. **11 of 14 source files are untested:**

| File                                                  |
| ----------------------------------------------------- |
| `packages/composables/src/useRouter.ts`               |
| `packages/composables/src/serverClient.ts`            |
| `packages/composables/src/useSessionSync.ts`          |
| `packages/composables/src/useServer.ts`               |
| `packages/composables/src/useFileUpload.ts`           |
| `packages/composables/src/useItems.ts`                |
| `packages/composables/src/useUsers.ts`                |
| `packages/composables/src/useActivity.ts`             |
| `packages/composables/src/useCollections.ts`          |
| `packages/composables/src/useSearch.ts`               |
| `packages/composables/src/useDeploymentNavigation.ts` |
| `packages/composables/src/registerClient.ts`          |
| `packages/composables/src/index.ts`                   |

**Highest priority now:** `useRouter.ts` — provides `push`, `replace`, `back` used throughout app. Next: `useSessionSync.ts` for cross-tab session sync.

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

| File                          |
| ----------------------------- |
| `api/src/routes/demo-data.ts` |
| `api/src/routes/activity.ts`  |
| `api/src/routes/search.ts`    |

---

## Recommended Priority Order

1. **`packages/composables/src/useRouter.ts`** — Provides `push`, `replace`, `back` used throughout app. High value, low risk, easy to mock.
2. **`packages/composables/src/useSessionSync.ts`** — Cross-tab session sync via StorageEvent listeners.
3. **`api/src/routes/demo-data.ts`** — Seeded demo users / credentials.

---

## Well-Covered Areas (Tests Exist ✅)

- App views: HomePage, LoginPage, RegisterPage
- App components: LoginForm, RegisterForm
- App: App.vue, hydrate.ts, sessionPersistence.ts
- App modules: defineModule, routerPass, routing, modules/index
- Router: router.test.ts (beforeEach guard behavior)
- Composables: useAuth.test.ts, authClient.test.ts
- Stores: auth, user, server, app
- Errors: forbidden, invalid-credentials, not-found, unauthorized
- Constants: auth, permissions
- System-data: collection, field, filter, permission, relation, translation
- Utils: all 11 utility source files + index
- Validation: validate-register, is-email, is-password
- API routes: auth, server, collections, items, users, files
- API middleware, API index
