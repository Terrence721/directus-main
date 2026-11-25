import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import type { Ref } from 'vue';

// Shared reactive refs
const mockSession: { value: { accessToken?: string | null } } = { value: { accessToken: 'test-token' } };
const mockCurrentUser: Ref<Record<string, unknown> | null> = ref(null);

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useUserStore: () => ({ user: mockCurrentUser, setUser: vi.fn(), clearUser: vi.fn() }),
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
	mockCurrentUser.value = { id: 'u1', firstName: null, lastName: null, email: 'nobody@example.com' };
	globalThis.fetch = vi.fn();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importSettings(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

describe('Debug SettingsCollection', () => {
	it('debug: currentUser value at mount when null', async () => {
		mockCurrentUser.value = null;
		console.log('mockCurrentUser.value:', mockCurrentUser.value);
		const S = await importSettings();
		const wrapper = mount(S);
		console.log('wrapper.vm.currentUser:', (wrapper.vm as unknown as { currentUser: unknown }).currentUser);
		console.log(
			'wrapper.vm.currentUser.value:',
			(wrapper.vm as unknown as { currentUser: { value?: unknown } | null }).currentUser?.value,
		);
		console.log('wrapper.html():', wrapper.html());
		await wrapper.vm.$nextTick();
		console.log(
			'after nextTick currentUser.value:',
			(wrapper.vm as unknown as { currentUser: { value?: unknown } | null }).currentUser?.value,
		);
	});

	it('debug: currentUser value at mount when has data', async () => {
		mockCurrentUser.value = { id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' };
		console.log('mockCurrentUser.value:', mockCurrentUser.value);
		const S = await importSettings();
		const wrapper = mount(S);
		console.log('wrapper.vm.currentUser:', (wrapper.vm as unknown as { currentUser: unknown }).currentUser);
		console.log(
			'wrapper.vm.currentUser.value:',
			(wrapper.vm as unknown as { currentUser: { value?: unknown } | null }).currentUser?.value,
		);
		console.log('wrapper.vm.form:', (wrapper.vm as unknown as { form: unknown }).form);
		console.log('wrapper.html():', wrapper.html());
		await wrapper.vm.$nextTick();
		console.log(
			'after nextTick currentUser.value:',
			(wrapper.vm as unknown as { currentUser: { value?: unknown } | null }).currentUser?.value,
		);
	});

	it('debug: null fields case', async () => {
		mockCurrentUser.value = { id: 'u1', firstName: null, lastName: null, email: 'nobody@example.com' };
		console.log('mockCurrentUser.value:', mockCurrentUser.value);
		const S = await importSettings();
		const wrapper = mount(S);
		console.log('wrapper.vm.currentUser:', (wrapper.vm as unknown as { currentUser: unknown }).currentUser);
		console.log(
			'wrapper.vm.currentUser.value:',
			(wrapper.vm as unknown as { currentUser: { value?: unknown } | null }).currentUser?.value,
		);
		console.log('wrapper.vm.form:', (wrapper.vm as unknown as { form: unknown }).form);
		console.log('wrapper.vm.form.email:', (wrapper.vm as unknown as { form: { email: unknown } }).form.email);
		console.log('wrapper.html():', wrapper.html());
		await wrapper.vm.$nextTick();
		console.log(
			'after nextTick currentUser.value:',
			(wrapper.vm as unknown as { currentUser: { value?: unknown } | null }).currentUser?.value,
		);
	});
});
