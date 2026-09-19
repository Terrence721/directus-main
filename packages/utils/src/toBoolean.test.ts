import { describe, expect, it } from 'vitest';
import { toBoolean } from './toBoolean.js';

describe('toBoolean', () => {
	it('returns true for the string "true"', () => {
		expect(toBoolean('true')).toBe(true);
	});

	it('returns true for the boolean true', () => {
		expect(toBoolean(true)).toBe(true);
	});

	it('returns true for the string "1"', () => {
		expect(toBoolean('1')).toBe(true);
	});

	it('returns true for the number 1', () => {
		expect(toBoolean(1)).toBe(true);
	});

	it('returns false for the string "false"', () => {
		expect(toBoolean('false')).toBe(false);
	});

	it('returns false for the boolean false', () => {
		expect(toBoolean(false)).toBe(false);
	});

	it('returns false for the string "0"', () => {
		expect(toBoolean('0')).toBe(false);
	});

	it('returns false for the number 0', () => {
		expect(toBoolean(0)).toBe(false);
	});

	it('returns false for null', () => {
		expect(toBoolean(null)).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(toBoolean(undefined)).toBe(false);
	});

	it('returns false for an empty string', () => {
		expect(toBoolean('')).toBe(false);
	});

	it('returns false for an arbitrary truthy-looking string', () => {
		expect(toBoolean('yes')).toBe(false);
	});

	it('returns false for a plain object', () => {
		expect(toBoolean({})).toBe(false);
	});

	it('returns false for an array', () => {
		expect(toBoolean([])).toBe(false);
	});
});
