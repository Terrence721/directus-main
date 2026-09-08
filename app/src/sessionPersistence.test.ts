import { useAuthStore } from '@directus/stores';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	clearPersistedSession,
	initSessionPersistence,
	persistSession,
	readPersistedSession,
} from './sessionPersistence.js';

beforeEach(() => {
	setActivePinia(createPinia());
});

afterEach(() => {
	clearPersistedSession();
});

describe('sessionPersistence', () => {
	it('returns null when no session has been persisted', () => {
		expect(readPersistedSession()).toBeNull();
	});

	it('round-trips a persisted session', () => {
		const session = { accessToken: 'token', expiresAt: Date.now() + 60_000 };

		persistSession(session);

		expect(readPersistedSession()).toEqual(session);
	});

	it('returns null once the session has been cleared', () => {
		persistSession({ accessToken: 'token', expiresAt: Date.now() + 60_000 });
		clearPersistedSession();

		expect(readPersistedSession()).toBeNull();
	});

	it('returns null for a malformed cookie value instead of throwing', () => {
		document.cookie = 'directus-main-session=not-json';

		expect(readPersistedSession()).toBeNull();
	});

	it('returns null when the cookie holds valid JSON of the wrong shape', () => {
		document.cookie = `directus-main-session=${encodeURIComponent(JSON.stringify({ foo: 'bar' }))}`;

		expect(readPersistedSession()).toBeNull();
	});
});

describe('initSessionPersistence', () => {
	it('restores a persisted session into the store on init', () => {
		const session = { accessToken: 'token', expiresAt: Date.now() + 60_000 };
		persistSession(session);

		const auth = useAuthStore();
		initSessionPersistence(auth);

		expect(auth.session).toEqual(session);
	});

	it('leaves the store logged out when no session is persisted', () => {
		const auth = useAuthStore();
		initSessionPersistence(auth);

		expect(auth.session).toBeNull();
	});

	it('persists the session once the store sets one', () => {
		const auth = useAuthStore();
		initSessionPersistence(auth);

		const expiresAt = Date.now() + 60_000;
		auth.setSession('token', expiresAt);

		expect(readPersistedSession()).toEqual({ accessToken: 'token', expiresAt });
	});

	it('clears the persisted session once the store clears it', () => {
		const auth = useAuthStore();
		initSessionPersistence(auth);

		auth.setSession('token', Date.now() + 60_000);
		auth.clearSession();

		expect(readPersistedSession()).toBeNull();
	});
});
