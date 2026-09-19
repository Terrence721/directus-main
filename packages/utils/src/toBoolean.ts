/**
 * Converts an environment-variable-style value to a real boolean — the same truthy/falsy string
 * and number forms `.env` files and `process.env` actually produce, not JS's own native
 * truthiness (which would treat any non-empty string, including `"false"`, as true).
 */
export function toBoolean(value: unknown): boolean {
	return value === 'true' || value === true || value === '1' || value === 1;
}
