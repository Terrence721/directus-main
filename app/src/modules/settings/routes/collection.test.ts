import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';

// Shared reactive refs — mutations here are visible inside the component
const mockSession: { value: { accessToken?: string | null } } = { value: { accessToken: 'test-token' } };
const mockCurrentUser: Ref<Record<string, unknown> | null> = ref(null);
const mockSetUser = vi.fn();

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<typeof import('@directus/stores')>('@directus/stores');
	return {
		...actual,
		useUserStore: () => ({ user: mockCurrentUser, setUser: mockSetUser, clearUser: vi.fn() }),
	};
});

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useAuth: () => ({ session: mockSession }),
	};
});

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());

	mockSession.value = { accessToken: 'test-token' };
	mockCurrentUser.value = { id: 'u1', firstName: '', lastName: '', email: '' };
	globalThis.fetch = vi.fn();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

// Lazy-import helper: forces a new module load each mount so the component
// reads the latest values of mockCurrentUser / mockSession.
async function importSettings(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

describe('SettingsCollection', () => {
	it('mounts without crashing', async () => {
		const S = await importSettings();
		const wrapper = mount(S);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders settings heading', async () => {
		const S = await importSettings();
		const wrapper = mount(S);
		expect(wrapper.find('h1').text()).toBe('Settings');
	});

	it('shows empty state when not logged in (no current user)', async () => {
		mockCurrentUser.value = null;
		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.settings-empty').exists()).toBe(true);
		expect(wrapper.find('.settings-card').exists()).toBe(false);
	});

	it('renders profile card and inputs when logged in', async () => {
		mockCurrentUser.value = {
			id: 'u1',
			firstName: 'Alice',
			lastName: 'Smith',
			email: 'alice@example.com',
		};
		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.settings-card').exists()).toBe(true);
		expect(wrapper.find('h2').text()).toBe('Profile');
		const inputs = wrapper.findAll<HTMLInputElement>('.settings-input');
		expect(inputs).toHaveLength(3);
		// v-model binds to .value on input elements
		expect(inputs[0].element.value).toBe('Alice');
		expect(inputs[1].element.value).toBe('Smith');
		expect(inputs[2].element.value).toBe('alice@example.com');
	});

	it('initializes form with null name fields rendered as empty strings', async () => {
		mockCurrentUser.value = {
			id: 'u1',
			firstName: null,
			lastName: null,
			email: 'nobody@example.com',
		};
		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.vm.$nextTick();
		const vm = wrapper.vm as unknown as { form: Record<string, string> };
		expect(vm.form.firstName).toBe('');
		expect(vm.form.lastName).toBe('');
		expect(vm.form.email).toBe('nobody@example.com');
	});

	it('calls PATCH /users/me on save with correct payload', async () => {
		mockCurrentUser.value = {
			id: 'u1',
			firstName: 'Bob',
			lastName: '',
			email: 'bob@example.com',
		};
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve({ data: { id: 'u1', firstName: 'BobUpdated', lastName: '', email: 'bob@example.com' } }),
		} as Response);

		const S = await importSettings();
		const wrapper = mount(S);
		const firstNameInput = wrapper.find<HTMLInputElement>('.settings-input');
		await firstNameInput.setValue('BobUpdated');
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));

		expect(globalThis.fetch).toHaveBeenCalledWith(
			'/users/me',
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
				body: expect.stringContaining('BobUpdated'),
			}),
		);
	});

	it('shows success message after save succeeds', async () => {
		mockCurrentUser.value = {
			id: 'u1',
			firstName: 'Carol',
			lastName: null,
			email: 'carol@example.com',
		};
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve({ data: { id: 'u1', firstName: 'Carol', lastName: null, email: 'carol@example.com' } }),
		} as Response);

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));

		expect(wrapper.find('.settings-success').exists()).toBe(true);
		expect(wrapper.find('.settings-success').text()).toBe('Profile updated successfully.');
		expect(wrapper.find('.settings-error').exists()).toBe(false);
	});

	it('shows error message when save receives non-ok response', async () => {
		mockCurrentUser.value = {
			id: 'u1',
			firstName: 'Dan',
			lastName: null,
			email: 'dan@example.com',
		};
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: false,
			status: 422,
			json: () => Promise.resolve({ errors: [] }),
		} as Response);

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));

		expect(wrapper.find('.settings-error').exists()).toBe(true);
		expect(wrapper.find('.settings-error').text()).toContain('Update failed');
		expect(wrapper.find('.settings-success').exists()).toBe(false);
	});

	it('shows server-side validation error message from response body', async () => {
		mockCurrentUser.value = {
			id: 'u1',
			firstName: 'Eve',
			lastName: null,
			email: 'eve@example.com',
		};
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: false,
			status: 422,
			json: () => Promise.resolve({ errors: [{ message: 'Email already taken' }] }),
		} as Response);

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));

		expect(wrapper.find('.settings-error').text()).toBe('Email already taken');
	});

	it('does not call API when no access token', async () => {
		mockSession.value = { accessToken: undefined };
		mockCurrentUser.value = { id: 'u1', firstName: 'Frank', lastName: null, email: 'frank@example.com' };

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();

		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('disables save button while saving', async () => {
		mockCurrentUser.value = { id: 'u1', firstName: 'Grace', lastName: null, email: 'grace@example.com' };
		const pending = new Promise<Response>(() => {});
		(
			globalThis.fetch as unknown as {
				mockImplementationOnce: (fn: () => Promise<Response>) => unknown;
			}
		).mockImplementationOnce(() => pending);

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();

		const saveBtn = wrapper.find('.settings-save');
		expect(saveBtn.attributes('disabled')).toBeDefined();
		expect(saveBtn.text()).toContain('Saving');
	});

	it('re-enables save button and clears error after save resolves', async () => {
		mockCurrentUser.value = { id: 'u1', firstName: 'Hank', lastName: null, email: 'hank@example.com' };
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve({ data: { id: 'u1', firstName: 'Hank', lastName: null, email: 'hank@example.com' } }),
		} as Response);

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));

		const saveBtn = wrapper.find('.settings-save');
		expect(saveBtn.attributes('disabled')).toBeUndefined();
		expect(saveBtn.text()).toBe('Save changes');
	});

	it('updates userStore.setUser on successful save', async () => {
		mockCurrentUser.value = { id: 'u1', firstName: 'Ivy', lastName: null, email: 'ivy@example.com' };
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve({ data: { id: 'u1', firstName: 'IvyNew', lastName: 'Test', email: 'ivy@example.com' } }),
		} as Response);

		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));

		expect(mockSetUser).toHaveBeenCalled();
		expect(mockSetUser).toHaveBeenCalledWith({
			id: 'u1',
			firstName: 'IvyNew',
			lastName: 'Test',
			email: 'ivy@example.com',
		});
	});

	it('resets error after a successful save following a previous failure', async () => {
		mockCurrentUser.value = { id: 'u1', firstName: 'Jack', lastName: null, email: 'jack@example.com' };

		// First call fails
		(
			globalThis.fetch as unknown as {
				mockRejectedValueOnce: (err: Error) => unknown;
			}
		).mockRejectedValueOnce(new Error('Network error'));
		const S = await importSettings();
		const wrapper = mount(S);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.settings-error').exists()).toBe(true);

		// Second call succeeds
		vi.clearAllMocks();
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () =>
				Promise.resolve({ data: { id: 'u1', firstName: 'Jack', lastName: null, email: 'jack@example.com' } }),
		} as Response);
		await wrapper.find('.settings-save').trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.settings-error').exists()).toBe(false);
	});
});