import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

/**
 * A single discriminated status instead of independent hydrated/hydrating/error
 * refs, so the app can't end up in an invalid combination (e.g. hydrated and
 * error both set at once) the way three separately-mutated booleans/refs could.
 */
export type HydrationStatus =
	{ status: 'idle' } | { status: 'hydrating' } | { status: 'hydrated' } | { status: 'error'; error: unknown };

export const useAppStore = defineStore('app', () => {
	const hydrationStatus = ref<HydrationStatus>({ status: 'idle' });
	const notificationsDrawerOpen = ref(false);

	const hydrated = computed(() => hydrationStatus.value.status === 'hydrated');
	const hydrating = computed(() => hydrationStatus.value.status === 'hydrating');
	const hydrationError = computed(() =>
		hydrationStatus.value.status === 'error' ? hydrationStatus.value.error : null,
	);

	function startHydration() {
		hydrationStatus.value = { status: 'hydrating' };
	}

	function completeHydration() {
		hydrationStatus.value = { status: 'hydrated' };
	}

	function failHydration(error: unknown) {
		hydrationStatus.value = { status: 'error', error };
	}

	function toggleNotificationsDrawer(open?: boolean) {
		notificationsDrawerOpen.value = open ?? !notificationsDrawerOpen.value;
	}

	return {
		hydrationStatus,
		hydrated,
		hydrating,
		hydrationError,
		notificationsDrawerOpen,
		startHydration,
		completeHydration,
		failHydration,
		toggleNotificationsDrawer,
	};
});
