import { useAppStore } from '@directus/stores';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';
import { router } from './router.js';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('App', () => {
	it('renders the routed view once hydration completes', async () => {
		await router.push('/login');
		const wrapper = mount(App, { global: { plugins: [router] } });

		expect(wrapper.find('form').exists()).toBe(true);
	});

	it('redirects to /login when a protected route is visited without a session', async () => {
		await router.push('/');
		const wrapper = mount(App, { global: { plugins: [router] } });

		await vi.waitFor(() => expect(wrapper.find('form').exists()).toBe(true));
		expect(router.currentRoute.value.path).toBe('/login');
	});

	it('completes hydration on mount', async () => {
		const app = useAppStore();
		await router.push('/login');

		mount(App, { global: { plugins: [router] } });

		expect(app.hydrated).toBe(true);
		expect(app.hydrating).toBe(false);
	});

	it('shows an error message if hydration fails after mount', async () => {
		const app = useAppStore();
		await router.push('/login');
		const wrapper = mount(App, { global: { plugins: [router] } });

		app.failHydration(new Error('network down'));
		await wrapper.vm.$nextTick();

		expect(wrapper.text()).toBe('Something went wrong.');
	});
});
