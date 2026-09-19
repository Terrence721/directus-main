import { describe, expect, it } from 'vitest';
import { toArray } from './toArray.js';

describe('toArray', () => {
	it('returns the same array reference if already an array', () => {
		const input = [1, 2, 3];
		expect(toArray(input)).toBe(input);
	});

	it('wraps a single value in an array', () => {
		expect(toArray(1)).toEqual([1]);
	});

	it('wraps null in an array', () => {
		expect(toArray(null)).toEqual([null]);
	});

	it('wraps undefined in an array', () => {
		expect(toArray(undefined)).toEqual([undefined]);
	});

	it('wraps an object in an array', () => {
		const obj = { key: 'value' };
		expect(toArray(obj)).toEqual([obj]);
	});

	it('splits a comma-separated string into an array', () => {
		expect(toArray('a,b,c')).toEqual(['a', 'b', 'c']);
	});

	it('does not trim whitespace around commas', () => {
		expect(toArray('a, b, c')).toEqual(['a', ' b', ' c']);
	});

	it('returns a single-element array for a string with no commas', () => {
		expect(toArray('hello')).toEqual(['hello']);
	});

	it('wraps an empty string in a single-element array', () => {
		expect(toArray('')).toEqual(['']);
	});

	it('returns an empty array unchanged', () => {
		expect(toArray([])).toEqual([]);
	});

	it('preserves a mixed-type array unchanged', () => {
		const input = [1, 'two', { three: 3 }];
		expect(toArray(input)).toBe(input);
	});

	it('wraps booleans in an array', () => {
		expect(toArray(true)).toEqual([true]);
		expect(toArray(false)).toEqual([false]);
	});

	it('wraps the number 0 in an array', () => {
		expect(toArray(0)).toEqual([0]);
	});
});
