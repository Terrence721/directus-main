import { useServerStore } from '@directus/stores';

/**
 * Composable that provides a minimal, type-safe API around the Pinia server store.
 * Returns the server info and a helper to set it.
 *
 * @example
 * import { useServer } from '@directus/composables';
 *
 * const { info, setInfo } = useServer();
 * console.log(info.projectName);
 */
export function useServer() {
	const server = useServerStore();

	return {
		/** The current server info, or null if not yet fetched. */
		info: server.info,
		/** Sets the server info in the store. */
		setInfo: server.setInfo,
	};
}
