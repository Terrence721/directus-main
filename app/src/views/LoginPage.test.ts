import { useAuthStore } from '@directus/stores';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../router.js';
import LoginPage from './LoginPage.vue';

beforeEach(async () => {
	setActivePinia(createPinia());
	await router.push('/login');
});

describe('LoginPage', () => {
	it('logs in and navigates to "/" after submitting the demo credentials', async () => {
		const wrapper = mount(LoginPage, { global: { plugins: [router] } });

		await wrapper.find('input[type="email"]').setValue('demo@directus-main.dev');
		await wrapper.find('input[type="password"]').setValue('demo1234');
		await wrapper.find('form').trigger('submit');

		await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/'));
		expect(useAuthStore().loggedIn).toBe(true);
	});

	it('shows an error and stays on /login when the credentials are wrong', async () => {
		const wrapper = mount(LoginPage, { global: { plugins: [router] } });

		await wrapper.find('input[type="email"]').setValue('wrong@example.com');
		await wrapper.find('input[type="password"]').setValue('wrongpass');
		await wrapper.find('form').trigger('submit');

		await vi.waitFor(() => expect(wrapper.find('[role="alert"]').text()).toBe('Invalid user credentials.'));
		expect(router.currentRoute.value.path).toBe('/login');
		expect(useAuthStore().loggedIn).toBe(false);
	});
});
