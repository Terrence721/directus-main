import { describe, expect, it } from 'vitest';
import { flatten } from './flatten.js';

describe('flatten', () => {
	it('flattens a one-level nested array', () => {
		expect(
			flatten([
				[1, 2],
				[3, 4],
			]),
		).toEqual([1, 2, 3, 4]);
	});

	it('flattens arbitrary nesting depth', () => {
		expect(flatten([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
	});

	it('preserves non-array elements at the top level', () => {
		expect(flatten([1, 'hello', null, undefined])).toEqual([1, 'hello']);
	});

	it('skips null and undefined without error', () => {
		expect(flatten([null, undefined, [1]])).toEqual([1]);
	});

	it('returns an empty array for an empty input', () => {
		expect(flatten([])).toEqual([]);
		expect(flatten([[]])).toEqual([]);
	});

	it('does not split strings into characters', () => {
		expect(flatten(['abc', ['def']])).toEqual(['abc', 'def']);
	});

	it('handles mixed types deeply', () => {
		const input: Array<{ id: number } | null> = [{ id: 1 }, null];
		expect(flatten(input)).toEqual([{ id: 1 }]);
	});

	it('preserves insertion order across all levels', () => {
		const result = flatten([1, [3, [5]], 2, [4]]);
		expect(result).toEqual([1, 3, 5, 2, 4]);
	});
});
