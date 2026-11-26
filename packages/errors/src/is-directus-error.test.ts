import { describe, expect, it } from 'vitest';
import { isDirectusError } from './is-directus-error';
import { DirectusError } from './create-error';
import { NotFoundError } from './errors/not-found';
import { UnauthorizedError } from './errors/unauthorized';
import { ForbiddenError } from './errors/forbidden';
import { InvalidCredentialsError } from './errors/invalid-credentials';

class CustomDirectusError extends DirectusError {
	readonly code = 'CUSTOM_ERROR';
	readonly status = 418;
}

describe('isDirectusError', () => {
	it('returns true for DirectusError instances without code check', () => {
		expect(isDirectusError(new NotFoundError())).toBe(true);
		expect(isDirectusError(new UnauthorizedError())).toBe(true);
		expect(isDirectusError(new ForbiddenError())).toBe(true);
		expect(isDirectusError(new InvalidCredentialsError())).toBe(true);
		expect(isDirectusError(new CustomDirectusError('test'))).toBe(true);
	});

	it('returns true for DirectusError with matching code', () => {
		expect(isDirectusError(new NotFoundError(), 'NOT_FOUND')).toBe(true);
		expect(isDirectusError(new UnauthorizedError(), 'UNAUTHORIZED')).toBe(true);
		expect(isDirectusError(new ForbiddenError(), 'FORBIDDEN')).toBe(true);
		expect(isDirectusError(new InvalidCredentialsError(), 'INVALID_CREDENTIALS')).toBe(true);
		expect(isDirectusError(new CustomDirectusError('test'), 'CUSTOM_ERROR')).toBe(true);
	});

	it('returns false for DirectusError with non-matching code', () => {
		expect(isDirectusError(new NotFoundError(), 'UNAUTHORIZED')).toBe(false);
		expect(isDirectusError(new UnauthorizedError(), 'NOT_FOUND')).toBe(false);
		expect(isDirectusError(new CustomDirectusError('test'), 'NOT_FOUND')).toBe(false);
	});

	it('returns false for non-DirectusError instances', () => {
		expect(isDirectusError(new Error())).toBe(false);
		expect(isDirectusError(new Error(), 'NOT_FOUND')).toBe(false);
		expect(isDirectusError(null)).toBe(false);
		expect(isDirectusError(undefined)).toBe(false);
		expect(isDirectusError({})).toBe(false);
		expect(isDirectusError('string')).toBe(false);
		expect(isDirectusError(42)).toBe(false);
	});

	it('returns false when DirectusError code property is missing', () => {
		const errorWithoutCode = { name: 'DirectusError', message: 'test' };
		expect(isDirectusError(errorWithoutCode)).toBe(false);
	});
});
