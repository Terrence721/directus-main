import { describe, expect, it } from 'vitest';
import { isPassword } from './is-password.js';

describe('isPassword', () => {
	it('returns false for short passwords', () => {
		expect(isPassword('Weak')).toBe(false);
		expect(isPassword('Sh0rt!')).toBe(false);
	});

	it('returns true for strong passwords', () => {
		expect(isPassword('Strong1!')).toBe(true);
		expect(isPassword('P@ssw0rd')).toBe(true);
		expect(isPassword('longenough1A!')).toBe(true);
	});

	it('returns false when missing required character classes', () => {
		expect(isPassword('alllowercase1!')).toBe(false);
		expect(isPassword('ALLUPPERCASE1!')).toBe(false);
		expect(isPassword('NoDigitsHere!')).toBe(false);
		expect(isPassword('NoSpecialChar1')).toBe(false);
	});

	it('returns false for non-string values', () => {
		expect(isPassword(null)).toBe(false);
		expect(isPassword(undefined)).toBe(false);
		expect(isPassword(123)).toBe(false);
		expect(isPassword({})).toBe(false);
	});
});