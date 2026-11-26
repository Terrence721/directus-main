import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router.js';

/**
 * Regression test for the dual-vue-router-instance crash:
 * "TypeError: Cannot read properties of undefined (reading 'push')" in App.vue's setup.
 *
 * @directus/composables' useRouter() must inject the same vue-router instance
 * the app installs. When a second copy of vue-router exists (e.g. a stray
 * nested node_modules copy under packages/composables), the two copies use
 * different Symbol injection keys: the app's app.use(router) provides the
 * instance under copy A's key, while the composable's inject() looks up
 * copy B's key and gets undefined. App.vue then destructures push from
 * undefined and the whole app fails to mount — on GitHub Pages and any
 * environment where the install layout produced the duplicate.
 *
 * This test deliberately does NOT mock @directus/composables (unlike
 * App.test.ts, which mocks useRouter and therefore can't catch this).
 * It runs the real composable against the real router, so it fails if the
 * two instances ever diverge again. Keep resolve.dedupe in
 * app/vite.config.ts and app/vitest.config.ts in sync when touching these.
 */
describe('App boots with the real router and composables (no mocks)', () => {
	it('renders the shell without an injection crash', async () => {
		const wrapper = mount(App, {
			global: { plugins: [createPinia(), router] },
		});
		await flushPromises();

		expect(wrapper.find('.sidebar').exists()).toBe(true);
		// Not logged in → hydration completes immediately and RouterView renders /login
		expect(router.currentRoute.value.path).toBe('/login');
		expect(wrapper.find('form').exists()).toBe(true);
	});
});
