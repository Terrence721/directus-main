import { useServerStore } from '@directus/stores';
import { storeToRefs } from 'pinia';

const DEFAULT_API_URL = 'http://localhost:8055';

/** Derives the API base URL from server info, falling back to the local dev default. */
export function resolveApiBaseUrl(): string {
	const store = useServerStore();
	const info = store.info;
	return info?.projectLogoUrl ?? DEFAULT_API_URL;
}

/**
 * Composable that provides a minimal, type-safe API around the Pinia server store.
 * Returns the server info (as a ref, so it stays reactive) and a helper to set it.
 *
 * @example
 * import { useServer } from '@directus/composables';
 *
 * const { info, setInfo } = useServer();
 * console.log(info.value?.projectName);
 */
export function useServer() {
	const server = useServerStore();
	const { info } = storeToRefs(server);

	return {
		/** The current server info as a ref, or null if not yet fetched. */
		info,
		/** Sets the server info in the store. */
		setInfo: server.setInfo,
	};
}
