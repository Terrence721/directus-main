import { describe, expect, it, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from './auth.js';

describe('useAuthStore', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('starts with no session and loggedIn=false', () => {
		const auth = useAuthStore();
		expect(auth.session).toBeNull();
		expect(auth.loggedIn).toBe(false);
	});

	it('sets a session and reports loggedIn=true while not expired', () => {
		const auth = useAuthStore();
		auth.setSession('abc123', Date.now() + 60_000);
		expect(auth.session?.accessToken).toBe('abc123');
		expect(auth.loggedIn).toBe(true);
	});

	it('clears the session', () => {
		const auth = useAuthStore();
		auth.setSession('abc123', Date.now() + 60_000);
		auth.clearSession();
		expect(auth.session).toBeNull();
		expect(auth.loggedIn).toBe(false);
	});

	it('reports loggedIn=false after expiry', () => {
		const auth = useAuthStore();
		auth.setSession('abc123', Date.now() - 1000);
		expect(auth.loggedIn).toBe(false);
	});
});
