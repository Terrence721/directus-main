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
		params: { provider: 'github' },
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

async function importProviderRuns(): Promise<(typeof import('./runs.vue'))['default']> {
	return (await import('./runs.vue')).default;
}

describe('ProviderRuns', () => {
	it('mounts without crashing', async () => {
		const ProviderRuns = await importProviderRuns();
		const wrapper = mount(ProviderRuns);
		expect(wrapper.exists()).toBe(true);
	});

	it('runs deployment runs header', async () => {
		const ProviderRuns = await importProviderRuns();
		const wrapper = mount(ProviderRuns);
		expect(wrapper.find('h1').text()).toBe('Deployment Runs');
	});

	it('shows empty message when no builds', async () => {
		const ProviderRuns = await importProviderRuns();
		const wrapper = mount(ProviderRuns);
		const wrapperVm = wrapper.vm as unknown as { builds: Array<unknown> };
		wrapperVm.builds = [];
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty').exists()).toBe(true);
		expect(wrapper.find('.empty').text()).toBe('No builds yet.');
	});

	it('renders builds list when builds exist', async () => {
		const ProviderRuns = await importProviderRuns();
		const wrapper = mount(ProviderRuns);
		const wrapperVm = wrapper.vm as unknown as { builds: Array<unknown> };
		wrapperVm.builds = [
			{
				id: '1',
				status: 'success',
				startedAt: '2026-11-20T10:30:00Z',
				duration: '2m 15s',
				commit: 'a1b2c3d',
				message: 'Fix auth helper tests',
			},
			{
				id: '2',
				status: 'failed',
				startedAt: '2026-11-20T09:15:00Z',
				duration: '1m 45s',
				commit: 'e4f5g6h',
				message: 'Add dashboard feature',
			},
		];
		await wrapper.vm.$nextTick();

		const buildItems = wrapper.findAll('.build-item');
		expect(buildItems).toHaveLength(2);

		// First build - success
		expect(buildItems[0].find('.build-id').text()).toBe('1');
		expect(buildItems[0].find('.build-status').text()).toBe('success');
		expect(buildItems[0].classes()).toContain('build--success');
		expect(buildItems[0].find('.build-commit').text()).toBe('a1b2c3d');
		expect(buildItems[0].find('.build-message').text()).toBe('Fix auth helper tests');
		expect(buildItems[0].find('.build-time').text()).toBe('2026-11-20T10:30:00Z');
		expect(buildItems[0].find('.build-duration').text()).toBe('2m 15s');

		// Second build - failed
		expect(buildItems[1].find('.build-id').text()).toBe('2');
		expect(buildItems[1].find('.build-status').text()).toBe('failed');
		expect(buildItems[1].classes()).toContain('build--failed');
		expect(buildItems[1].find('.build-commit').text()).toBe('e4f5g6h');
		expect(buildItems[1].find('.build-message').text()).toBe('Add dashboard feature');
		expect(buildItems[1].find('.build-time').text()).toBe('2026-11-20T09:15:00Z');
		expect(buildItems[1].find('.build-duration').text()).toBe('1m 45s');
	});
});
