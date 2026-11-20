import { useAuthStore } from '@directus/stores';

/**
 * Composable that provides a minimal, type-safe API around the Pinia auth store.
 * Returns the logged-in status and helper methods to set/clear the session.
 *
 * @example
 * import { useAuth } from '@directus/composables';
 *
 * const { loggedIn, session, setSession, clearSession } = useAuth();
 * if (loggedIn) { ... }
 */
export function useAuth() {
	const auth = useAuthStore();

	return {
		/** Returns true if a valid session is present (not null and not expired). */
		loggedIn: auth.loggedIn,
		/** The current session, or null when logged out. */
		session: auth.session,
		/** Sets the session in the store. */
		setSession: auth.setSession,
		/** Clears the session from the store. */
		clearSession: auth.clearSession,
	};
}
