import { useAppStore, useAuthStore } from '@directus/stores';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('App', () => {
	it('shows the login form when there is no session', () => {
		const wrapper = mount(App);

		expect(wrapper.find('form').exists()).toBe(true);
		expect(wrapper.find('button').text()).toBe('Sign in');
	});

	it('logs in and shows "Welcome back." after a successful submit', async () => {
		const wrapper = mount(App);

		await wrapper.find('input[type="email"]').setValue('jane@example.com');
		await wrapper.find('input[type="password"]').setValue('hunter2');
		await wrapper.find('form').trigger('submit');

		await vi.waitFor(() => expect(wrapper.text()).toBe('Welcome back.'));
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
