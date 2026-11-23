import { createPinia, setActivePinia } from 'pinia';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { router } from './router';
import { useAuthStore } from '@directus/stores';

// Mock both the module and the named export; @directus/stores is mocked to provide a controlled
// useAuthStore() instead of the real Pinia-backed one.
vi.mock('@directus/stores', () => ({
	useAuthStore: vi.fn(),
}));

beforeEach(() => {
	setActivePinia(createPinia());
	vi.clearAllMocks();
});

describe('router beforeEach guards', () => {
	it('redirects to login with session_expired reason when accessing a protected route without a session', async () => {
		(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			loggedIn: false,
			session: null,
		});

		router.push('/');

		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe('login');
		});
	});

	it('redirects home from login when already logged in', async () => {
		(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			loggedIn: true,
			session: { accessToken: 'tok', expiresAt: Date.now() + 60_000 },
		});

		router.push('/login');

		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe('home');
		});
	});

	it('redirects home from register when already logged in', async () => {
		(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			loggedIn: true,
			session: { accessToken: 'tok', expiresAt: Date.now() + 60_000 },
		});

		router.push('/register');

		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe('home');
		});
	});

	it('allows navigation to login without a session', async () => {
		(useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
			loggedIn: false,
			session: null,
		});

		router.push('/login');

		await vi.waitFor(() => {
			expect(router.currentRoute.value.name).toBe('login');
		});
	});
});
