import { describe, expect, it } from 'vitest';
import { groupBy } from './group-by.js';

describe('groupBy', () => {
	it('groups elements by the key function', () => {
		const result = groupBy(
			[
				{ type: 'a', n: 1 },
				{ type: 'b', n: 2 },
				{ type: 'a', n: 3 },
			],
			(x) => x.type,
		);

		expect(result.a).toEqual([
			{ type: 'a', n: 1 },
			{ type: 'a', n: 3 },
		]);
		expect(result.b).toEqual([{ type: 'b', n: 2 }]);
	});

	it('preserves insertion order within each bucket', () => {
		const result = groupBy([1, 2, 3, 4, 5, 6], (n) => (n % 2 === 0 ? 'even' : 'odd'));
		expect(result.even).toEqual([2, 4, 6]);
		expect(result.odd).toEqual([1, 3, 5]);
	});

	it('works with numeric keys', () => {
		const result = groupBy(
			[
				{ g: 1, v: 'a' },
				{ g: 2, v: 'b' },
				{ g: 1, v: 'c' },
			],
			(x) => x.g,
		);
		expect(result[1]).toEqual([
			{ g: 1, v: 'a' },
			{ g: 1, v: 'c' },
		]);
		expect(result[2]).toEqual([{ g: 2, v: 'b' }]);
	});

	it('returns an empty object for an empty input', () => {
		expect(groupBy([], (x: number) => x)).toEqual({});
	});

	it('does not mutate the input array', () => {
		const input = [
			{ k: 'a', n: 1 },
			{ k: 'b', n: 2 },
		];
		groupBy(input, (x) => x.k);
		expect(input).toEqual([
			{ k: 'a', n: 1 },
			{ k: 'b', n: 2 },
		]);
	});
});
