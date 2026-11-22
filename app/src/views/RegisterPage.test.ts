import { DirectusError } from '@directus/errors';
import { useAuthStore } from '@directus/stores';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../router.js';
import RegisterPage from './RegisterPage.vue';

class TestRegisterError extends DirectusError<void> {
	readonly code = 'REGISTER_ERROR';
	readonly status = 400;

	constructor(message: string) {
		super(message, undefined);
	}
}

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useRouter: () => ({
			router,
			route: router.currentRoute,
			push: router.push.bind(router),
			replace: router.replace.bind(router),
			back: router.back.bind(router),
		}),
		register: vi.fn(),
	};
});

import * as composables from '@directus/composables';

enableAutoUnmount(afterEach);

beforeEach(async () => {
	setActivePinia(createPinia());
	await router.push('/register');
	vi.clearAllMocks();
});

describe('RegisterPage', () => {
	it('registers a new user and navigates to "/" on success', async () => {
		vi.mocked(composables.register).mockResolvedValue({
			session: { accessToken: 'new-token', expiresAt: Date.now() + 60_000 },
		} as Awaited<ReturnType<typeof composables.register>>);

		const wrapper = mount(RegisterPage, { global: { plugins: [router] } });

		await wrapper.find('input[type="email"]').setValue('new@example.com');
		await wrapper.find('input[type="password"]').setValue('password123');
		const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
		await passwordInputs[0].setValue('password123');
		await passwordInputs[1].setValue('password123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		expect(useAuthStore().loggedIn).toBe(true);
		expect(router.currentRoute.value.path).toBe('/');
		expect(composables.register).toHaveBeenCalledOnce();
	});

	it('shows an error message and stays on /register when registration fails', async () => {
		vi.mocked(composables.register).mockRejectedValue(new TestRegisterError('Email already registered.'));

		const wrapper = mount(RegisterPage, { global: { plugins: [router] } });

		await wrapper.find('input[type="email"]').setValue('existing@example.com');
		await wrapper.find('input[type="password"]').setValue('password123');
		const passwordInputs = wrapper.findAll('input[autocomplete="new-password"]');
		await passwordInputs[0].setValue('password123');
		await passwordInputs[1].setValue('password123');
		await wrapper.find('form').trigger('submit');
		await flushPromises();

		await vi.waitFor(() => expect(wrapper.find('[role="alert"]').text()).toBe('Email already registered.'));
		expect(router.currentRoute.value.path).toBe('/register');
		expect(useAuthStore().loggedIn).toBe(false);
	});
});
