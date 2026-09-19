# @directus/system-data

Definitions and types for Directus system collections — a real, verified zero-dependency leaf (no
runtime `dependencies`, only `devDependencies`), which is why `PermissionsAction` is declared
locally here instead of reusing `@directus/constants`'s identical type.

## Type-only tests: a real exception to how this repo verifies things

Every file in `src/` so far is a pure type declaration — `interface`/`type`, no runtime code. That
matters for testing: the usual `yarn test` (`vitest run`) can't catch a type-level bug here.
`expectTypeOf(...)` assertions compile away to inert no-ops at runtime, so a **false** assertion
still reports "test passed" — proven, not assumed, while building this package: a real regression
was introduced on purpose, `yarn test` alone did not catch it, and `yarn typecheck` did.

The actual check is `yarn typecheck` (`tsc --noEmit -p tsconfig.typecheck.json`), wired into CI's
`Typecheck` step (right after `Build`). That step, not `test`, is what makes every `*.test.ts` file
in this package meaningful. If you add a new type-only test:

1. Write the assertion.
2. Break the type on purpose and confirm `yarn typecheck` fails.
3. Fix it and confirm `yarn typecheck` passes again.

`yarn test` passing proves nothing on its own in this package — only `yarn typecheck` does.
