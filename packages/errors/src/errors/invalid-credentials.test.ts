import { describe, expect, it } from 'vitest';
import { isDirectusError } from '../is-directus-error.js';
import { InvalidCredentialsError } from './invalid-credentials.js';

describe('InvalidCredentialsError', () => {
	it('has the correct code and status', () => {
		const error = new InvalidCredentialsError();

		expect(error.code).toBe('INVALID_CREDENTIALS');
		expect(error.status).toBe(401);
	});

	it('always uses the same generic message', () => {
		const error = new InvalidCredentialsError();

		expect(error.message).toBe('Invalid user credentials.');
	});

	it('formats toString as "name [code]: message"', () => {
		const error = new InvalidCredentialsError();

		expect(error.toString()).toBe('DirectusError [INVALID_CREDENTIALS]: Invalid user credentials.');
	});

	it('is identified by isDirectusError', () => {
		const error = new InvalidCredentialsError();

		expect(isDirectusError(error)).toBe(true);
		expect(isDirectusError(error, 'INVALID_CREDENTIALS')).toBe(true);
		expect(isDirectusError(error, 'FORBIDDEN')).toBe(false);
		expect(isDirectusError(new Error('plain error'))).toBe(false);
	});
});
