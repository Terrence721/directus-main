import { useAuthStore } from '@directus/stores';
import { onMounted, onUnmounted } from 'vue';

/**
 * Syncs session state across browser tabs.
 * Listens for 'storage' events so that logging out in one tab
 * immediately invalidates sessions in all other tabs.
 *
 * Call this once during app initialization (e.g., in main.ts or App.vue).
 */
export function initSessionSync(): void {
	function readCookie(): { accessToken: string; expiresAt: number } | null {
		const match = document.cookie.match(/(?:^|;) directus-main-session=([^;]*)/);
		if (!match) return null;
		try {
			return JSON.parse(decodeURIComponent(match[1])) as { accessToken: string; expiresAt: number };
		} catch {
			return null;
		}
	}

	function handleStorage(e: StorageEvent) {
		if (e.key !== 'directus-main-session') return;

		const auth = useAuthStore();
		const current = readCookie();

		// If cookie was cleared in another tab, log out locally too
		if (!e.newValue && current === null) {
			auth.clearSession();
		} else if (current !== null) {
			// Another tab persisted a new session — sync it here
			auth.setSession(current.accessToken, current.expiresAt);
		}
	}

	onMounted(() => {
		window.addEventListener('storage', handleStorage);
	});

	onUnmounted(() => {
		window.removeEventListener('storage', handleStorage);
	});
}
