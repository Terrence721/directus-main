import { useAppStore, useAuthStore } from '@directus/stores';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App.vue';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('App', () => {
	it('shows "Please log in." when there is no session', () => {
		const wrapper = mount(App);

		expect(wrapper.text()).toBe('Please log in.');
	});

	it('shows "Welcome back." when logged in', () => {
		useAuthStore().setSession('token', Date.now() + 60_000);

		const wrapper = mount(App);

		expect(wrapper.text()).toBe('Welcome back.');
	});

	it('completes hydration on mount', () => {
		const app = useAppStore();

		mount(App);

		expect(app.hydrated).toBe(true);
		expect(app.hydrating).toBe(false);
	});

	it('shows an error message if hydration fails after mount', async () => {
		const app = useAppStore();
		const wrapper = mount(App);

		app.failHydration(new Error('network down'));
		await wrapper.vm.$nextTick();

		expect(wrapper.text()).toBe('Something went wrong.');
	});
});
