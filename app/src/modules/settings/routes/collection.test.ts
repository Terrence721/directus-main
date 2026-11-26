import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();
const mockUser = ref<{
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
} | null>({
	id: '1',
	firstName: 'Test',
	lastName: 'User',
	email: 'test@example.com',
	role: 'admin',
});
const mockSetUser = vi.fn();
const mockSession = ref({ accessToken: 'test-token' });

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useAuth: () => ({
			session: mockSession,
		}),
		resolveApiBaseUrl: () => 'http://test-api.example.com',
	};
});

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useUserStore: () => ({
			user: mockUser.value,
			setUser: mockSetUser,
		}),
	};
});

vi.mock('vue-router', () => ({
	useRouter: () => ({ push: routerPushSpy }),
}));

window.fetch = vi.fn();

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routerPushSpy.mockClear();
	mockUser.value = {
		id: '1',
		firstName: 'Test',
		lastName: 'User',
		email: 'test@example.com',
		role: 'admin',
	};
	mockSession.value = { accessToken: 'test-token' };
	(window.fetch as unknown as ReturnType<typeof vi.fn>).mockReset();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importSettingsCollection(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

type SettingsCollectionVm = {
	form: { firstName: string; lastName: string; email: string };
	saving: boolean;
	error: Error | null;
	success: boolean;
};

describe('SettingsCollection', () => {
	it('mounts without crashing', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders settings view header', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		expect(wrapper.find('h1').text()).toBe('Settings');
	});

	it('shows profile card when user is logged in', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		expect(wrapper.find('.settings-card').exists()).toBe(true);
		expect(wrapper.find('.settings-card h2').text()).toBe('Profile');
	});

	it('shows not logged in message when no user', async () => {
		mockUser.value = null;
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.settings-empty').exists()).toBe(true);
		expect(wrapper.find('.settings-empty').text()).toBe('Not logged in.');
	});

	it('shows success message when update succeeds', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		const wrapperVm = wrapper.vm as unknown as SettingsCollectionVm;
		wrapperVm.success = true;
		wrapperVm.error = null;
		wrapperVm.saving = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.settings-success').exists()).toBe(true);
		expect(wrapper.find('.settings-success').text()).toBe('Profile updated successfully.');
	});

	it('shows error message when update fails', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		const wrapperVm = wrapper.vm as unknown as SettingsCollectionVm;
		wrapperVm.error = new Error('Update failed');
		wrapperVm.success = false;
		wrapperVm.saving = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.settings-error').exists()).toBe(true);
		expect(wrapper.find('.settings-error').text()).toBe('Update failed');
	});

	it('shows saving state when saving', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		const wrapperVm = wrapper.vm as unknown as SettingsCollectionVm;
		wrapperVm.saving = true;
		wrapperVm.error = null;
		wrapperVm.success = false;
		await wrapper.vm.$nextTick();

		const saveButton = wrapper.find('.settings-save');
		expect(saveButton.attributes('disabled')).toBeDefined();
		expect(saveButton.text()).toBe('Saving…');
	});

	it('calls handleSave when save button clicked', async () => {
		const SettingsCollection = await importSettingsCollection();
		const wrapper = mount(SettingsCollection);
		const wrapperVm = wrapper.vm as unknown as SettingsCollectionVm;
		wrapperVm.form = { firstName: 'John', lastName: 'Doe', email: 'john@example.com' };
		wrapperVm.saving = false;
		wrapperVm.error = null;
		wrapperVm.success = false;

		(window.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				data: { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'admin' },
			}),
		});

		const saveButton = wrapper.find('.settings-save');
		await saveButton.trigger('click');
		await new Promise((resolve) => setTimeout(resolve, 0));
		await wrapper.vm.$nextTick();

		// handleSave succeeded: setUser called, success true, saving back to false
		expect(mockSetUser).toHaveBeenCalled();
		expect(wrapperVm.success).toBe(true);
		expect(wrapperVm.saving).toBe(false);
	});
});
