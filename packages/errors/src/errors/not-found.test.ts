import { describe, expect, it } from 'vitest';
import { NotFoundError } from './not-found.js';
import { DirectusError } from '../create-error.js';

describe('NotFoundError', () => {
	it('has the NOT_FOUND code', () => {
		const error = new NotFoundError();
		expect(error.code).toBe('NOT_FOUND');
	});

	it('defaults to status 404', () => {
		const error = new NotFoundError();
		expect(error.status).toBe(404);
	});

	it('uses a sensible default message', () => {
		const error = new NotFoundError();
		expect(error.message).toBe('Resource not found.');
	});

	it('accepts a custom message', () => {
		const error = new NotFoundError('Page missing');
		expect(error.message).toBe('Page missing');
	});

	it('extends DirectusError and passes instanceof checks', () => {
		const error = new NotFoundError();
		expect(error).toBeInstanceOf(DirectusError);
	});

	it('formats toString correctly', () => {
		const error = new NotFoundError('missing item');
		// .name is set once in DirectusError.prototype.constructor; subclasses do not
		// override it, so the printed name stays 'DirectusError' even when instanceof
		// resolves through the prototype chain. This matches ForbiddenError's own test.
		expect(error.toString()).toBe('DirectusError [NOT_FOUND]: missing item');
	});
});
