/**
 * Type guard that returns true when `value` is `null` or `undefined`.
 * Distinct from `isPlainObject`, which treats `null` as a plain object.
 */
export function isNil(value: unknown): value is null | undefined {
	return value === null || value === undefined;
}
