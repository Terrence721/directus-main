# Testing Gap Analysis — directus-main Repository

Generated from analysis of all source files vs. corresponding test files.

## Summary

- **61 test files** exist across the repository.
- Many core packages are well-covered (stores, errors, constants, utils, validation, system-data, API routes).
- **Critical gaps** exist in the app layer (main.ts, router.ts) and the `@directus/composables` package (13 of 14 source files untested).

---

## App Layer — Testing Gaps

These files directly affect app behavior and were recently modified (bug fixes for auto-login and login hang).

### Untested Source Files

| File                                        | Risk Level | Notes                                                                                                                                                                                  |
| ------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/src/main.ts`                           | **HIGH**   | App entry point: Pinia + router + mount. Contains boot sequence. **Recently edited** — removed `initSessionPersistence()`. No test covers the boot sequence or session behavior.       |
| `app/src/router.ts`                         | **HIGH**   | Route guards: `beforeEach` auth logic. **Recently edited** — fixed infinite redirect loop on login. No tests for auth redirects, `session_expired` reason param, or route transitions. |
| `app/src/components/ItemsFinder.vue`        | LOW        | UI component                                                                                                                                                                           |
| `app/src/components/ColumnPicker.vue`       | LOW        | UI component                                                                                                                                                                           |
| `app/src/components/CollectionSelector.vue` | LOW        | UI component                                                                                                                                                                           |

### Untested App Module Composables

| File                                                             |
| ---------------------------------------------------------------- |
| `app/src/modules/content/composables/use-collections-manager.ts` |
| `app/src/modules/content/composables/use-navigation.ts`          |
| `app/src/modules/visual/composables/use-collections-manager.ts`  |
| `app/src/modules/visual/composables/use-navigation.ts`           |

---

## `@directus/composables` Package — Testing Gaps

Only `useAuth.ts` has a test (`useAuth.test.ts`). **13 of 14 source files are untested:**

| File                                                  |
| ----------------------------------------------------- |
| `packages/composables/src/useRouter.ts`               |
| `packages/composables/src/serverClient.ts`            |
| `packages/composables/src/authClient.ts`              |
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

**Highest priority:** `authClient.ts` — contains real vs. simulated login logic. Critical for the login flow that was recently fixed.

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

1. **`app/src/router.ts`** — Contains auth route guard logic just fixed (infinite redirect loop). Tests needed for: redirect to login with `session_expired`, redirect home when already logged in, clearing reason query param.
2. **`app/src/main.ts`** — App boot sequence. Especially relevant since session persistence was removed.
3. **`packages/composables/src/authClient.ts`** — Real vs. simulated login. Critical for login flow.
4. **`packages/composables/src/useRouter.ts`** — Provides `push`, `replace`, `back` used throughout app.
5. **`packages/composables/src/useSessionSync.ts`** — Cross-tab session sync.
6. **`api/src/routes/demo-data.ts`** — Seeded demo users / credentials.

---

## Well-Covered Areas (Tests Exist ✅)

- App views: HomePage, LoginPage, RegisterPage
- App components: LoginForm, RegisterForm
- App: App.vue, hydrate.ts, sessionPersistence.ts
- App modules: defineModule, routerPass, routing, modules/index
- Composables: useAuth.test.ts
- Stores: auth, user, server, app
- Errors: forbidden, invalid-credentials, not-found, unauthorized
- Constants: auth, permissions
- System-data: collection, field, filter, permission, relation, translation
- Utils: all 11 utility source files + index
- Validation: validate-register, is-email, is-password
- API routes: auth, server, collections, items, users, files
- API middleware, API index
