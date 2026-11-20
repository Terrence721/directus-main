import { describe, expect, it } from 'vitest';
import { validateRegister } from './validate-register.js';

describe('validateRegister', () => {
	it('returns empty array for valid data', () => {
		const result = validateRegister({
			email: 'test@example.com',
			password: 'secret123',
			firstName: 'Test',
			lastName: 'User',
		});

		expect(result).toEqual([]);
	});

	it('returns error for missing email', () => {
		const result = validateRegister({
			email: '',
			password: 'secret123',
			firstName: 'Test',
			lastName: 'User',
		});

		expect(result).toEqual([{ field: 'email', message: 'Email is required.' }]);
	});

	it('returns error for missing password', () => {
		const result = validateRegister({
			email: 'test@example.com',
			password: '',
			firstName: 'Test',
			lastName: 'User',
		});

		expect(result).toEqual([{ field: 'password', message: 'Password is required.' }]);
	});

	it('returns error for short password', () => {
		const result = validateRegister({
			email: 'test@example.com',
			password: '123',
			firstName: 'Test',
			lastName: 'User',
		});

		expect(result).toEqual([{ field: 'password', message: 'Password must be at least 6 characters.' }]);
	});

	it('returns error for empty firstName when provided', () => {
		const result = validateRegister({
			email: 'test@example.com',
			password: 'secret123',
			firstName: '',
			lastName: 'User',
		});

		expect(result).toEqual([{ field: 'firstName', message: 'First name must not be empty.' }]);
	});

	it('returns error for empty lastName when provided', () => {
		const result = validateRegister({
			email: 'test@example.com',
			password: 'secret123',
			firstName: 'Test',
			lastName: '',
		});

		expect(result).toEqual([{ field: 'lastName', message: 'Last name must not be empty.' }]);
	});

	it('returns multiple errors when multiple fields are invalid', () => {
		const result = validateRegister({
			email: '',
			password: '123',
			firstName: '',
			lastName: '',
		});

		expect(result).toEqual([
			{ field: 'email', message: 'Email is required.' },
			{ field: 'password', message: 'Password must be at least 6 characters.' },
			{ field: 'firstName', message: 'First name must not be empty.' },
			{ field: 'lastName', message: 'Last name must not be empty.' },
		]);
	});

	it('accepts undefined optional fields', () => {
		const result = validateRegister({
			email: 'test@example.com',
			password: 'secret123',
		});

		expect(result).toEqual([]);
	});

	it('normalizes email before validation', () => {
		const result = validateRegister({
			email: '  test@example.com  ',
			password: 'secret123',
		});

		expect(result).toEqual([]);
	});
});
