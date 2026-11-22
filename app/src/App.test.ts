import { useAppStore, useAuthStore } from '@directus/stores';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';
import { router } from './router.js';
import * as composables from '@directus/composables';

// Mock the entire @directus/composables module so we control fetchServerInfo per-test
vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		fetchServerInfo: vi.fn(),
		useRouter: () => ({
			router,
			route: router.currentRoute,
			push: router.push.bind(router),
			replace: router.replace.bind(router),
			back: router.back.bind(router),
		}),
	};
});

enableAutoUnmount(afterEach);

beforeEach(() => {
	setActivePinia(createPinia());
	vi.clearAllMocks();
	// Default: server returns valid info
	vi.mocked(composables.fetchServerInfo).mockResolvedValue({
		projectName: 'Directus Main Demo',
		projectLogoUrl: null,
		projectColor: '#563acc',
		authProviders: [{ name: 'Email / Password', driver: 'local' }],
		registrationEnabled: true,
	});
});

describe('App', () => {
	it('renders the shell with the routed view once hydration completes', async () => {
		await router.push('/login');
		const wrapper = mount(App, { global: { plugins: [router] } });

		// Shell contains a hamburger button (always visible) plus the routed login form
		expect(wrapper.find('.hamburger').exists()).toBe(true);
		expect(wrapper.find('form').exists()).toBe(true);
	});

	it('redirects to /login when a protected route is visited without a session', async () => {
		await router.push('/');
		const wrapper = mount(App, { global: { plugins: [router] } });

		// Navigation redirect to /login happens; login page renders its form inside the shell
		await vi.waitFor(() => expect(wrapper.find('form').exists()).toBe(true));
		expect(router.currentRoute.value.path).toBe('/login');
	});

	it('redirects to / when /login is visited while already logged in', async () => {
		useAuthStore().setSession('token', Date.now() + 60_000);
		await router.push('/login');
		const wrapper = mount(App, { global: { plugins: [router] } });

		// Redirected away from /login; home renders under the shell
		await vi.waitFor(() => expect(wrapper.find('.shell').exists()).toBe(true));
		expect(router.currentRoute.value.path).toBe('/');
	});

	it('completes hydration on mount', async () => {
		const app = useAppStore();
		await router.push('/login');

		mount(App, { global: { plugins: [router] } });

		await vi.waitFor(() => {
			expect(app.hydrated).toBe(true);
			expect(app.hydrating).toBe(false);
		});
	});

	it('shows an error message if hydration fails after mount', async () => {
		const app = useAppStore();
		// Override: server call will fail for this test
		vi.mocked(composables.fetchServerInfo).mockRejectedValue(new Error('network down'));
		useAuthStore().setSession('token', Date.now() + 60_000);
		await router.push('/login');
		const wrapper = mount(App, { global: { plugins: [router] } });

		// With a broken hydration path, hydrate() leaves the store in error state
		// (does not call completeHydration), so .hydration-error renders instead of RouterView
		await vi.waitFor(() => {
			expect(app.hydrationError).not.toBeNull();
			expect(app.hydrated).toBe(false);
			expect(wrapper.find('.hydration-error').exists()).toBe(true);
		});
	});
});
