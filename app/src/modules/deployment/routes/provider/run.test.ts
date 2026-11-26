import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useDeploymentNavigation: () => ({
			providers: ref([]),
			loading: ref(false),
		}),
	};
});

vi.mock('vue-router', () => ({
	useRoute: () => ({
		params: { provider: 'github', buildId: '123' },
	}),
	useRouter: () => ({ push: routerPushSpy }),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routerPushSpy.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importProviderRun(): Promise<(typeof import('./run.vue'))['default']> {
	return (await import('./run.vue')).default;
}

describe('ProviderRun', () => {
	it('mounts without crashing', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders build details header', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		expect(wrapper.find('h1').text()).toBe('Build Details');
	});

	it('displays build ID', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		expect(wrapper.find('.build-id').text()).toBe('Build 1');
	});

	it('displays build status with success class', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		const status = wrapper.find('.build-status');
		expect(status.text()).toBe('success');
		expect(status.classes()).toContain('status--success');
	});

	it('displays build commit and message', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		expect(wrapper.find('.build-commit').text()).toBe('a1b2c3d');
		expect(wrapper.find('.build-message').text()).toBe('Fix auth helper tests');
	});

	it('displays build time and duration', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		expect(wrapper.find('.build-time').text()).toBe('2026-11-20T10:30:00Z');
		expect(wrapper.find('.build-duration').text()).toBe('2m 15s');
	});

	it('renders changes list when changes exist', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		expect(wrapper.find('.changes-list').exists()).toBe(true);
		const changes = wrapper.findAll('.change-item');
		expect(changes).toHaveLength(3);
		expect(changes[0].text()).toContain('app/src/views/LoginPage.vue');
		expect(changes[0].text()).toContain('added logoutReason prop');
	});

	it('shows empty message when no changes', async () => {
		const ProviderRun = await importProviderRun();
		const wrapper = mount(ProviderRun);
		const wrapperVm = wrapper.vm as unknown as { build: { changes: Array<{ file: string; change: string }> } };
		wrapperVm.build.changes = [];
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty').exists()).toBe(true);
		expect(wrapper.find('.empty').text()).toBe('No changes tracked.');
	});
});
