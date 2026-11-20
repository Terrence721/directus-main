/**
 * Deeply flattens a nested array structure into a single flat array, preserving
 * element order. Strings and other non-iterables are treated as atomic values
 * (not split), so `'abc'` stays as `'abc'` rather than becoming `['a','b','c']`.
 * Nullish entries at any depth are silently dropped.
 *
 * Useful for route path resolution, collapsing nested data layers, and processing
 * hierarchical configs.
 */
export function flatten<T = unknown>(value: T | (T | T[])[] | null): T[] {
	const result: T[] = [];

	function walk(item: unknown): void {
		if (item === null || item === undefined) return;

		if (Array.isArray(item)) {
			for (const child of item) {
				walk(child);
			}
		} else {
			result.push(item as T);
		}
	}

	walk(value);
	return result;
}
