import { useRouter as useVueRouter, useRoute } from 'vue-router';

/**
 * Composable that provides typed access to Vue Router's instance and current route.
 * Prefer this over `useRouter`/`useRoute` from `vue-router` directly for
 * consistent imports across the codebase.
 *
 * @example
 * import { useRouter } from '@directus/composables';
 *
 * const { router, route, push, replace, back } = useRouter();
 * await push('/login');
 */
export function useRouter() {
	const router = useVueRouter();
	const route = useRoute();

	return {
		/** The Vue Router instance. */
		router,
		/** The current route (reactive). */
		route,
		/** Navigate to a new location (pushes onto history stack). */
		push: router.push.bind(router),
		/** Navigate to a new location (replaces current history entry). */
		replace: router.replace.bind(router),
		/** Go back one step in history. */
		back: router.back.bind(router),
	};
}