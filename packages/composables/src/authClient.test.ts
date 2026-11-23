import { describe, expect, it, vi, beforeEach } from 'vitest';
import { login } from './authClient';
import { InvalidCredentialsError } from '@directus/errors';

vi.mock('./serverClient', () => ({
	resolveApiBaseUrl: vi.fn(() => 'http://localhost:8055'),
}));

const DEMO_EMAIL = 'demo@directus-main.dev';
const DEMO_PASSWORD = 'demo1234';

describe('authClient.login', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns session object with valid demo credentials', async () => {
		const result = await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

		expect(result).toHaveProperty('accessToken');
		expect(result).toHaveProperty('expiresAt');
		expect(typeof result.accessToken).toBe('string');
		expect(typeof result.expiresAt).toBe('number');
	});

	it('throws InvalidCredentialsError when email is incorrect', async () => {
		await expect(
			login({ email: 'wrong@example.com', password: DEMO_PASSWORD }),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it('throws InvalidCredentialsError when password is incorrect', async () => {
		await expect(
			login({ email: DEMO_EMAIL, password: 'wrongpassword' }),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it('throws InvalidCredentialsError when both credentials are wrong', async () => {
		await expect(
			login({ email: 'wrong@example.com', password: 'wrongpassword' }),
		).rejects.toThrow(InvalidCredentialsError);
	});

	it('sets expiresAt at least 1 hour in the future', async () => {
		const now = Date.now();
		const result = await login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });

		expect(result.expiresAt).toBeGreaterThan(now + 60 * 60 * 1000);
	});
});
