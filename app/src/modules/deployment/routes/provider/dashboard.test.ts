import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();
const mockProviders = ref([
	{
		provider: 'github',
		configured: false,
	},
]);
const mockLoading = ref(false);

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useDeploymentNavigation: () => ({
			providers: mockProviders,
			loading: mockLoading,
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
	mockProviders.value = [];
	mockLoading.value = false;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importProviderDashboard(): Promise<(typeof import('./dashboard.vue'))['default']> {
	return (await import('./dashboard.vue')).default;
}

describe('ProviderDashboard', () => {
	it('mounts without crashing', async () => {
		const ProviderDashboard = await importProviderDashboard();
		const wrapper = mount(ProviderDashboard);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders provider dashboard header', async () => {
		const ProviderDashboard = await importProviderDashboard();
		const wrapper = mount(ProviderDashboard);
		expect(wrapper.find('h1').text()).toBe('github Dashboard');
	});

	it('shows loading state when loading', async () => {
		const ProviderDashboard = await importProviderDashboard();
		const wrapper = mount(ProviderDashboard);
		mockLoading.value = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('div')[1].text()).toBe('Loading...');
	});

	it('displays provider status when configured', async () => {
		const ProviderDashboard = await importProviderDashboard();
		const wrapper = mount(ProviderDashboard);
		mockProviders.value = [{ provider: 'github', configured: true }];
		mockLoading.value = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('p')).toHaveLength(2);
		expect(wrapper.findAll('p')[0].text()).toBe('Provider: github');
		expect(wrapper.findAll('p')[1].text()).toBe('Status: Configured');
	});

	it('displays provider status when not configured', async () => {
		const ProviderDashboard = await importProviderDashboard();
		const wrapper = mount(ProviderDashboard);
		mockProviders.value = [{ provider: 'github', configured: false }];
		mockLoading.value = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('p')).toHaveLength(2);
		expect(wrapper.findAll('p')[0].text()).toBe('Provider: github');
		expect(wrapper.findAll('p')[1].text()).toBe('Status: Not configured');
	});

	it('handles unknown provider gracefully', async () => {
		const ProviderDashboard = await importProviderDashboard();
		const wrapper = mount(ProviderDashboard);
		mockProviders.value = [{ provider: 'bitbucket', configured: true }];
		mockLoading.value = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('h1').text()).toBe('github Dashboard');
		expect(wrapper.findAll('p')[0].text()).toBe('Provider: github');
		expect(wrapper.findAll('p')[1].text()).toBe('Status: Not configured');
	});
});
