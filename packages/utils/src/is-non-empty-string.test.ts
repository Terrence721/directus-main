import { describe, expect, it } from 'vitest';
import { isNonEmptyString } from './is-non-empty-string.js';

describe('isNonEmptyString', () => {
	it('returns true for a non-empty string', () => {
		expect(isNonEmptyString('hello')).toBe(true);
	});

	it('returns false for an empty string', () => {
		expect(isNonEmptyString('')).toBe(false);
	});

	it('returns false for whitespace-only string', () => {
		expect(isNonEmptyString('   ')).toBe(true);
	});

	it('returns false for null', () => {
		expect(isNonEmptyString(null)).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(isNonEmptyString(undefined)).toBe(false);
	});

	it('returns false for a number', () => {
		expect(isNonEmptyString(42)).toBe(false);
	});

	it('returns false for a boolean', () => {
		expect(isNonEmptyString(true)).toBe(false);
		expect(isNonEmptyString(false)).toBe(false);
	});

	it('returns false for an object', () => {
		expect(isNonEmptyString({})).toBe(false);
	});

	it('returns false for an array', () => {
		expect(isNonEmptyString([])).toBe(false);
	});

	it('returns true for a string containing only whitespace (non-zero length)', () => {
		expect(isNonEmptyString('\t\n')).toBe(true);
	});
});
