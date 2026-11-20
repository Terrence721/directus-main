import { describe, expect, it } from 'vitest';
import { isNil } from './is-nil.js';

describe('isNil', () => {
	it('returns true for null', () => {
		expect(isNil(null)).toBe(true);
	});

	it('returns true for undefined', () => {
		expect(isNil(undefined)).toBe(true);
	});

	it('returns false for a string', () => {
		expect(isNil('hello')).toBe(false);
	});

	it('returns false for zero', () => {
		expect(isNil(0)).toBe(false);
	});

	it('returns false for an empty string', () => {
		expect(isNil('')).toBe(false);
	});

	it('narrows the type to null | undefined', () => {
		const value: unknown = null;
		if (isNil(value)) {
			// Inside the branch, value is null | undefined — no error.
			expect(value).toBeNull();
		}
	});
});
