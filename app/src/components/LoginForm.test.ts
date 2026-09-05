import { DirectusError } from '@directus/errors';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm.vue';

class TestError extends DirectusError<void> {
	readonly code = 'TEST_ERROR';
	readonly status = 400;

	constructor(message: string) {
		super(message, undefined);
	}
}

describe('LoginForm', () => {
	it('calls onSubmit with the entered credentials', async () => {
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const wrapper = mount(LoginForm, { props: { onSubmit } });

		await wrapper.find('input[type="email"]').setValue('jane@example.com');
		await wrapper.find('input[type="password"]').setValue('hunter2');
		await wrapper.find('form').trigger('submit');

		expect(onSubmit).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'hunter2' });
	});

	it('shows a loading state while submitting', async () => {
		let resolveSubmit!: () => void;
		const onSubmit = vi.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
		const wrapper = mount(LoginForm, { props: { onSubmit } });

		const submitPromise = wrapper.find('form').trigger('submit');
		await vi.waitFor(() => expect(wrapper.find('button').text()).toBe('Signing in…'));
		expect(wrapper.find('button').attributes('disabled')).toBeDefined();

		resolveSubmit();
		await submitPromise;

		await vi.waitFor(() => expect(wrapper.find('button').text()).toBe('Sign in'));
	});

	it('shows the DirectusError message on failure', async () => {
		const onSubmit = vi.fn().mockRejectedValue(new TestError('Invalid credentials'));
		const wrapper = mount(LoginForm, { props: { onSubmit } });

		await wrapper.find('form').trigger('submit');

		expect(wrapper.find('[role="alert"]').text()).toBe('Invalid credentials');
	});

	it('shows a generic message when the error is not a DirectusError', async () => {
		const onSubmit = vi.fn().mockRejectedValue(new Error('network down'));
		const wrapper = mount(LoginForm, { props: { onSubmit } });

		await wrapper.find('form').trigger('submit');

		expect(wrapper.find('[role="alert"]').text()).toBe('Something went wrong. Please try again.');
	});

	it('ignores a submit while one is already in progress', async () => {
		let resolveSubmit!: () => void;
		const onSubmit = vi.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
		const wrapper = mount(LoginForm, { props: { onSubmit } });

		const first = wrapper.find('form').trigger('submit');
		await wrapper.find('form').trigger('submit');

		expect(onSubmit).toHaveBeenCalledTimes(1);

		resolveSubmit();
		await first;
	});
});
