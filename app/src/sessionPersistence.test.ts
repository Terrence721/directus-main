import { afterEach, describe, expect, it } from 'vitest';
import { clearPersistedSession, persistSession, readPersistedSession } from './sessionPersistence.js';

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
