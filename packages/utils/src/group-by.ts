/**
 * Groups array elements into a record of arrays keyed by the return value of
 * `keyFn`. The key function is called once per element, and the original
 * element is preserved in the corresponding bucket. Elements are appended in
 * insertion order within each bucket.
 *
 * @example
 * groupBy([{ type: 'a', n: 1 }, { type: 'b', n: 2 }, { type: 'a', n: 3 }], (x) => x.type)
 * // { a: [{ type: 'a', n: 1 }, { type: 'a', n: 3 }], b: [{ type: 'b', n: 2 }] }
 */
export function groupBy<T, Key extends string | number | symbol>(
	value: readonly T[],
	keyFn: (item: T) => Key,
): Record<Key, T[]> {
	const result = {} as Record<Key, T[]>;

	for (const item of value) {
		const key = keyFn(item);
		(result[key] ??= []).push(item);
	}

	return result;
}
