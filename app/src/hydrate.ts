import { useAppStore, useAuthStore, useServerStore } from '@directus/stores';
import { fetchServerInfo } from '@directus/composables';
import { ref, computed } from 'vue';

/** The project name resolved during init; exposed so components can read it reactively. */
export const projectName = ref<string>('');

/**
 * Composable returning reactive hydration booleans derived from the current
 * active Pinia instance. Must be called inside a component setup or test
 * where Pinia is already active — this ensures we always read the correct
 * store rather than caching refs from a stale instance.
 */
export function useHydrationState() {
	const app = useAppStore();
	const hydrating = computed(() => app.hydrating);
	const hydrationError = computed(() => {
		const error = app.hydrationError;
		return error == null ? null : error instanceof Error ? error : new Error(String(error));
	});
	return { hydrating, hydrationError };
}

/**
 * Run the one-time bootstrap that every privileged view depends on:
 *   1. Mark hydration as started (so the shell renders the loading state).
 *   2. Fetch server info and seed the server store + global project name.
 *   3. Mark hydration complete (or failed) so RouterView can render.
 *
 * This is extracted from App.vue so it can be unit-tested without mounting
 * the full shell — callers invoke it once before any route guard or component
 * reads the hydration state.
 *
 * On success: sets status to 'hydrated' and returns true.
 * On failure: leaves status as 'error' (hydrationError persists) and returns false,
 *             allowing the template to show the error message instead of the main shell.
 *
 * @returns true when hydration succeeded, false when the server returned an error.
 */
export async function hydrate(): Promise<boolean> {
	const app = useAppStore();
	const auth = useAuthStore();

	if (!auth.loggedIn) {
		app.completeHydration();
		return true;
	}

	app.startHydration();
	try {
		const info = await fetchServerInfo();
		useServerStore().setInfo(info);
		projectName.value = info.projectName;
		app.completeHydration();
		return true;
	} catch (err) {
		// Keep the error state so the template can show the error message.
		// Do NOT call completeHydration() here — that would overwrite the error
		// and cause the shell to render instead of the error fallback.
		app.failHydration(err instanceof Error ? err : new Error(String(err)));
		return false;
	}
}
