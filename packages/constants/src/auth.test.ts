import { describe, expect, it } from 'vitest';
import { LOCAL_AUTH_DRIVER } from './auth.js';

describe('LOCAL_AUTH_DRIVER', () => {
	it('is the literal string "local"', () => {
		expect(LOCAL_AUTH_DRIVER).toBe('local');
	});
});
