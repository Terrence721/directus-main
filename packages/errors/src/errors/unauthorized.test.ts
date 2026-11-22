import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from './unauthorized.js';

describe('UnauthorizedError', () => {
	it('has code UNAUTHORIZED and status 401', () => {
		const error = new UnauthorizedError();
		expect(error.code).toBe('UNAUTHORIZED');
		expect(error.status).toBe(401);
	});

	it('falls back to the default message when no extensions are provided', () => {
		const error = new UnauthorizedError();
		expect(error.message).toBe('Session invalid or expired.');
	});

	it('can carry an optional cause via ErrorOptions', () => {
		const cause = new Error('token refreshed failed');
		const error = new UnauthorizedError({ cause });
		expect(error.cause).toBe(cause);
	});
});
