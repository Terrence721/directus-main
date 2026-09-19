/**
 * Wraps a value in an array if it isn't one already. A comma-separated string splits into its
 * parts (not trimmed — a real, load-bearing part of the contract, not an oversight) rather than
 * becoming a single-element array, since that's the shape a CSV-style query param or env var
 * actually needs.
 */
export function toArray<T = unknown>(value: T | T[]): T[] {
	if (typeof value === 'string') {
		return value.split(',') as unknown as T[];
	}

	return Array.isArray(value) ? value : [value];
}
