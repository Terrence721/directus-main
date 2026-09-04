import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth.js';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('useAuthStore', () => {
	it('starts logged out', () => {
		const auth = useAuthStore();

		expect(auth.loggedIn).toBe(false);
	});

	it('is logged in once a session with a future expiry is set', () => {
		const auth = useAuthStore();

		auth.setSession('token', Date.now() + 60_000);

		expect(auth.loggedIn).toBe(true);
	});

	it('is logged out once the session has expired', () => {
		const auth = useAuthStore();

		auth.setSession('token', Date.now() - 1);

		expect(auth.loggedIn).toBe(false);
	});

	it('is logged out after clearSession', () => {
		const auth = useAuthStore();

		auth.setSession('token', Date.now() + 60_000);
		auth.clearSession();

		expect(auth.loggedIn).toBe(false);
		expect(auth.session).toBeNull();
	});
});
