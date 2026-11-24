import { describe, expect, it } from 'vitest';
import { DirectusError, isDirectusError } from './index.js';

class TestError extends DirectusError {
	readonly code = 'TEST_ERROR';
	readonly status = 418;

	constructor(message: string, options?: ErrorOptions) {
		super(message, undefined as never, options);
	}
}

describe('DirectusError', () => {
	it('has correct name and code', () => {
		const error = new TestError('Test message');

		expect(error.name).toBe('DirectusError');
		expect(error.code).toBe('TEST_ERROR');
		expect(error.status).toBe(418);
	});

	it('includes message and stack', () => {
		const error = new TestError('Test message');

		expect(error.message).toBe('Test message');
		expect(error.stack).toBeDefined();
	});

	it('passes through options', () => {
		const cause = new Error('cause');
		const error = new TestError('Test message', { cause });

		expect(error.cause).toBe(cause);
	});

	it('formats toString correctly', () => {
		const error = new TestError('Test message');

		expect(error.toString()).toBe('DirectusError [TEST_ERROR]: Test message');
	});
});

describe('isDirectusError', () => {
	it('identifies DirectusError instances', () => {
		const error = new TestError('Test message');

		expect(isDirectusError(error)).toBe(true);
	});

	it('identifies DirectusError instances with specific code', () => {
		const error = new TestError('Test message');

		expect(isDirectusError(error, 'TEST_ERROR')).toBe(true);
	});

	it('does not identify DirectusError with wrong code', () => {
		const error = new TestError('Test message');

		expect(isDirectusError(error, 'WRONG_CODE')).toBe(false);
	});

	it('does not identify plain Error instances', () => {
		const error = new Error('Plain error');

		expect(isDirectusError(error)).toBe(false);
	});

	it('does not identify non-error objects', () => {
		expect(isDirectusError({})).toBe(false);
	});
});
