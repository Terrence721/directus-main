import { DirectusError } from './create-error.js';

/**
 * For narrowing to a specific error's typed `extensions`, prefer `instanceof SpecificError`
 * over this with a code string — every error is a real class, so instanceof already gives
 * full type narrowing with no extra machinery. This is for the two cases that need instead:
 * "is this any DirectusError at all" (omit `code`), or checking against a code known only
 * as a string (e.g. deserialized from an API response, with no class reference available).
 */
export function isDirectusError(value: unknown, code?: string): value is DirectusError {
	return value instanceof DirectusError && (code === undefined || value.code === code);
}
