import { DirectusError } from '@directus/errors';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterForm from './RegisterForm.vue';

class TestRegisterError extends DirectusError<void> {
	readonly code = 'REGISTER_ERROR';
	readonly status = 400;

	constructor(message: string) {
		super(message, undefined);
	}
}

vi.mock('../api/registerClient.js', () => ({
	register: vi.fn(),
}));

const { register } = await import('../api/registerClient.js');

enableAutoUnmount(afterEach);

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('RegisterForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls onSubmit with all entered fields on valid submission', async () => {
		const submit = vi.fn().mockResolvedValue(undefined);

		const wrapper = mount(RegisterForm, { props: { onSubmit: submit } });

		await wrapper.find('input[type="email"]').setValue('test@example.com');
		await wrapper.find('input[autocomplete="given-name"]').setValue('Test');
		await wrapper.find('input[autocomplete="family-name"]').setValue('User');
		await wrapper.findAll('input[type="password"]')[0].setValue('longenough123');
		await wrapper.findAll('input[type="password"]')[1].setValue('longenough123');
		await wrapper.find('form').trigger('submit.prevent');

		expect(submit).toHaveBeenCalledTimes(1);
		expect(submit).toHaveBeenCalledWith({
			email: 'test@example.com',
			password: 'longenough123',
			firstName: 'Test',
			lastName: 'User',
		});
	});

	it('shows an error when passwords do not match', async () => {
		const submit = vi.fn().mockResolvedValue(undefined);
		const wrapper = mount(RegisterForm, { props: { onSubmit: submit } });

		await wrapper.find('input[type="email"]').setValue('a@b.c');
		await wrapper.findAll('input[type="password"]')[0].setValue('pass123');
		await wrapper.findAll('input[type="password"]')[1].setValue('different');
		await wrapper.find('form').trigger('submit.prevent');

		expect(submit).not.toHaveBeenCalled();
		expect(wrapper.find('[role="alert"]').text()).toBe('Passwords do not match.');
	});

	it('shows an error when password is shorter than 6 characters', async () => {
		const submit = vi.fn().mockResolvedValue(undefined);
		const wrapper = mount(RegisterForm, { props: { onSubmit: submit } });

		await wrapper.find('input[type="email"]').setValue('a@b.c');
		await wrapper.findAll('input[type="password"]')[0].setValue('short');
		await wrapper.findAll('input[type="password"]')[1].setValue('short');
		await wrapper.find('form').trigger('submit.prevent');

		expect(submit).not.toHaveBeenCalled();
		expect(wrapper.find('[role="alert"]').text()).toBe('Password must be at least 6 characters.');
	});

	it('disables submit while in progress and prevents concurrent submissions', async () => {
		let resolveSubmit!: () => void;
		const submit = vi.fn(() => new Promise<void>((resolve) => (resolveSubmit = resolve)));
		const wrapper = mount(RegisterForm, { props: { onSubmit: submit } });

		await wrapper.find('input[type="email"]').setValue('a@b.c');
		await wrapper.findAll('input[type="password"]')[0].setValue('longenough123');
		await wrapper.findAll('input[type="password"]')[1].setValue('longenough123');

		// First submit starts the pending request
		const first = wrapper.find('form').trigger('submit.prevent');
		await vi.waitFor(() => expect(submit).toHaveBeenCalledTimes(1));

		// Second submit is ignored
		await wrapper.find('form').trigger('submit.prevent');
		expect(submit).toHaveBeenCalledTimes(1);

		resolveSubmit();
		await first;
	});

	it('shows the error message returned by onSubmit on failure', async () => {
		const submit = vi.fn().mockRejectedValue(new TestRegisterError('Email already registered.'));
		const wrapper = mount(RegisterForm, { props: { onSubmit: submit } });

		await wrapper.find('input[type="email"]').setValue('a@b.c');
		await wrapper.findAll('input[type="password"]')[0].setValue('longenough123');
		await wrapper.findAll('input[type="password"]')[1].setValue('longenough123');
		await wrapper.find('form').trigger('submit.prevent');

		await vi.waitFor(() => {
			expect(wrapper.find('[role="alert"]').text()).toBe('Email already registered.');
		});
	});
});
