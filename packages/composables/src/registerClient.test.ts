import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { register } from './registerClient';

describe('registerClient', () => {
	// Mock environment variables
	const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
	const originalEnv = { ...env };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv('MODE', 'development');
	});

	afterEach(() => {
		vi.restoreAllMocks();
		for (const key in env) {
			delete env[key];
		}
		for (const key in originalEnv) {
			env[key] = originalEnv[key];
		}
	});

	describe('register', () => {
		it('calls registerReal in development mode', async () => {
			vi.stubEnv('MODE', 'development');

			const fetchMock = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					accessToken: 'test-token',
					expiresAt: Date.now() + 3600000,
					user: {
						id: 'user-1',
						email: 'test@example.com',
						firstName: 'Test',
						lastName: 'User',
						avatarUrl: null,
					},
				}),
			});
			vi.stubGlobal('fetch', fetchMock);

			const result = await register({
				email: 'test@example.com',
				password: 'password123',
				firstName: 'Test',
				lastName: 'User',
			});

			expect(fetchMock).toHaveBeenCalledOnce();
			expect(fetchMock).toHaveBeenCalledWith('http://localhost:8055/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: 'test@example.com',
					password: 'password123',
					firstName: 'Test',
					lastName: 'User',
				}),
			});
			expect(result.session.accessToken).toBe('test-token');
			expect(result.user.email).toBe('test@example.com');
			expect(result.user.firstName).toBe('Test');
			expect(result.user.lastName).toBe('User');
		});

		it('calls registerSimulated in production mode', async () => {
			vi.stubEnv('MODE', 'production');

			const result = await register({
				email: 'test@example.com',
				password: 'password123',
				firstName: 'Test',
				lastName: 'User',
			});

			expect(result.session.accessToken).toMatch(/^demo-\d+$/);
			expect(result.session.expiresAt).toBeGreaterThan(Date.now());
			expect(result.user.email).toBe('test@example.com');
			expect(result.user.firstName).toBe('Test');
			expect(result.user.lastName).toBe('User');
			expect(result.user.id).toMatch(/^user-\d+$/);
			expect(result.user.avatarUrl).toBeNull();
		});

		it('throws on email already registered (NOT_FOUND)', async () => {
			vi.stubEnv('MODE', 'development');

			const fetchMock = vi.fn().mockResolvedValue({
				ok: false,
				json: async () => ({ code: 'NOT_FOUND', message: 'Email already registered.' }),
			});
			vi.stubGlobal('fetch', fetchMock);

			await expect(
				register({
					email: 'existing@example.com',
					password: 'password123',
				}),
			).rejects.toThrow('Email already registered.');
		});

		it('throws InvalidCredentialsError on other API errors', async () => {
			vi.stubEnv('MODE', 'development');

			const fetchMock = vi.fn().mockResolvedValue({
				ok: false,
				json: async () => ({ code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }),
			});
			vi.stubGlobal('fetch', fetchMock);

			await expect(
				register({
					email: 'test@example.com',
					password: 'wrong',
				}),
			).rejects.toThrow('Invalid user credentials.');
		});

		it('handles missing error message gracefully', async () => {
			vi.stubEnv('MODE', 'development');

			const fetchMock = vi.fn().mockResolvedValue({
				ok: false,
				json: async () => ({}),
			});
			vi.stubGlobal('fetch', fetchMock);

			await expect(
				register({
					email: 'test@example.com',
					password: 'password123',
				}),
			).rejects.toThrow('Invalid user credentials.');
		});

		it('handles optional firstName and lastName', async () => {
			vi.stubEnv('MODE', 'development');

			const fetchMock = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					accessToken: 'test-token',
					expiresAt: Date.now() + 3600000,
					user: {
						id: 'user-1',
						email: 'test@example.com',
						firstName: null,
						lastName: null,
						avatarUrl: null,
					},
				}),
			});
			vi.stubGlobal('fetch', fetchMock);

			const result = await register({
				email: 'test@example.com',
				password: 'password123',
			});

			expect(result.user.firstName).toBeNull();
			expect(result.user.lastName).toBeNull();
		});
	});

	describe('registerSimulated', () => {
		it('resolves with demo session and user', async () => {
			vi.stubEnv('MODE', 'production');

			const result = await register({
				email: 'demo@example.com',
				password: 'password123',
			});

			expect(result.session.accessToken).toMatch(/^demo-\d+$/);
			expect(result.session.expiresAt).toBeGreaterThan(Date.now());
			expect(result.user.email).toBe('demo@example.com');
			expect(result.user.id).toMatch(/^user-\d+$/);
		});
	});
});
