import { describe, expect, it } from 'vitest';
import { isDirectusError } from '../is-directus-error.js';
import { ForbiddenError } from './forbidden.js';

describe('ForbiddenError', () => {
	it('has the correct code and status', () => {
		const error = new ForbiddenError();

		expect(error.code).toBe('FORBIDDEN');
		expect(error.status).toBe(403);
	});

	it('uses a default message when no reason is given', () => {
		const error = new ForbiddenError();

		expect(error.message).toBe("You don't have permission to access this.");
	});

	it('uses the given reason as the message', () => {
		const error = new ForbiddenError({ reason: 'Missing the update permission' });

		expect(error.message).toBe('Missing the update permission');
	});

	it('falls back to the default message when reason is an empty string', () => {
		const error = new ForbiddenError({ reason: '' });

		expect(error.message).toBe("You don't have permission to access this.");
	});

	it('formats toString as "name [code]: message"', () => {
		const error = new ForbiddenError({ reason: 'Missing the update permission' });

		expect(error.toString()).toBe('DirectusError [FORBIDDEN]: Missing the update permission');
	});

	it('is identified by isDirectusError', () => {
		const error = new ForbiddenError();

		expect(isDirectusError(error)).toBe(true);
		expect(isDirectusError(error, 'FORBIDDEN')).toBe(true);
		expect(isDirectusError(error, 'SOMETHING_ELSE')).toBe(false);
		expect(isDirectusError(new Error('plain error'))).toBe(false);
	});
});
