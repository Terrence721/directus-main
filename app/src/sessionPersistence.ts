import type { Session, useAuthStore } from '@directus/stores';

const COOKIE_NAME = 'directus-main-session';

/**
 * Cookie-backed session persistence, so a hard refresh doesn't log a real visitor out. This
 * lives in app/, not @directus/stores: browser storage is an app concern, and the store itself
 * stays environment-agnostic (packages/stores runs its own tests in a plain Node environment,
 * with no document to depend on).
 */
export function readPersistedSession(): Session | null {
	const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));

	if (!match) return null;

	try {
		const parsed: unknown = JSON.parse(decodeURIComponent(match[1]));

		if (
			typeof parsed === 'object' &&
			parsed !== null &&
			typeof (parsed as Session).accessToken === 'string' &&
			typeof (parsed as Session).expiresAt === 'number'
		) {
			return parsed as Session;
		}
	} catch {
		// Malformed cookie value — treat it as no session rather than throwing.
	}

	return null;
}

export function persistSession(session: Session): void {
	const value = encodeURIComponent(JSON.stringify(session));
	document.cookie = `${COOKIE_NAME}=${value}; expires=${new Date(session.expiresAt).toUTCString()}; SameSite=Lax`;
}

export function clearPersistedSession(): void {
	document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
}

/**
 * Restores a persisted session into the store on boot, then keeps the cookie in sync with every
 * future setSession/clearSession call. Takes the store instance as a parameter rather than
 * calling useAuthStore() itself, so it stays easy to test against a fresh store per test.
 */
export function initSessionPersistence(authStore: ReturnType<typeof useAuthStore>): void {
	const persisted = readPersistedSession();

	if (persisted) {
		authStore.setSession(persisted.accessToken, persisted.expiresAt);
	}

	authStore.$subscribe(
		(_mutation, state) => {
			if (state.session) {
				persistSession(state.session);
			} else {
				clearPersistedSession();
			}
		},
		// Pinia's default flush ('pre') batches until the next Vue tick — too late for a page
		// unload right after setSession/clearSession. 'sync' persists the cookie immediately.
		{ flush: 'sync' },
	);
}
