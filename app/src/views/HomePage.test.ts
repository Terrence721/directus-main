import { useAuthStore } from '@directus/stores';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../router.js';
import HomePage from './HomePage.vue';

beforeEach(async () => {
	setActivePinia(createPinia());
	useAuthStore().setSession('token', Date.now() + 60_000);
	await router.push('/');
});

describe('HomePage', () => {
	it('shows "Welcome back." with a logout button', () => {
		const wrapper = mount(HomePage, { global: { plugins: [router] } });

		expect(wrapper.text()).toBe('Welcome back.Log out');
	});

	it('logs out and navigates to /login when "Log out" is clicked', async () => {
		const wrapper = mount(HomePage, { global: { plugins: [router] } });

		await wrapper.find('button').trigger('click');

		await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/login'));
		expect(useAuthStore().loggedIn).toBe(false);
	});
});
