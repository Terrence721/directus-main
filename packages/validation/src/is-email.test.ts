import { describe, expect, it } from 'vitest';
import { isEmail } from './is-email.js';

describe('isEmail', () => {
	it('returns true for valid email addresses', () => {
		expect(isEmail('test@example.com')).toBe(true);
		expect(isEmail('user.name@domain.co.uk')).toBe(true);
		expect(isEmail('user+tag@example.com')).toBe(true);
		expect(isEmail('user_name@example.com')).toBe(true);
		expect(isEmail('user-name@example.com')).toBe(true);
		expect(isEmail('a@b.co')).toBe(true);
		expect(isEmail('user@example.co')).toBe(true);
	});

	it('returns false for invalid email addresses', () => {
		expect(isEmail('invalid-email')).toBe(false);
		expect(isEmail('@example.com')).toBe(false);
		expect(isEmail('test@')).toBe(false);
		expect(isEmail('test@.com')).toBe(false);
		expect(isEmail('test@@example.com')).toBe(false);
		expect(isEmail('test@exam..ple.com')).toBe(false);
	});

	it('returns false for non-string values', () => {
		expect(isEmail(null)).toBe(false);
		expect(isEmail(undefined)).toBe(false);
		expect(isEmail(123)).toBe(false);
		expect(isEmail({})).toBe(false);
		expect(isEmail([])).toBe(false);
	});

	it('narrows the type to string', () => {
		const value: unknown = 'test@example.com';
		if (isEmail(value)) {
			// Inside the branch, value is string — no error.
			expect(value).toContain('@');
		}
	});
});