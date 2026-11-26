import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();
const mockProviders = ref([]);
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

async function importProviderSettings(): Promise<(typeof import('./settings.vue'))['default']> {
	return (await import('./settings.vue')).default;
}

describe('ProviderSettings', () => {
	it('mounts without crashing', async () => {
		const ProviderSettings = await importProviderSettings();
		const wrapper = mount(ProviderSettings);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders provider settings header', async () => {
		const ProviderSettings = await importProviderSettings();
		const wrapper = mount(ProviderSettings);
		expect(wrapper.find('h1').text()).toBe('github Settings');
	});

	it('shows loading state when loading', async () => {
		const ProviderSettings = await importProviderSettings();
		const wrapper = mount(ProviderSettings);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('.provider-settings > div')[0].text()).toBe('Loading...');
	});

	it('displays provider status when not configured', async () => {
		const ProviderSettings = await importProviderSettings();
		const wrapper = mount(ProviderSettings);
		// config is auto-unwrapped on the setup proxy, so assign the object directly
		const wrapperVm = wrapper.vm as unknown as { config: { name: string; configured: boolean } };
		wrapperVm.config = { name: 'github', configured: false };
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('p')).toHaveLength(2);
		expect(wrapper.findAll('p')[0].text()).toBe('Provider: github');
		expect(wrapper.findAll('p')[1].text()).toBe('Status: Not configured');
	});

	it('displays provider status when configured', async () => {
		const ProviderSettings = await importProviderSettings();
		const wrapper = mount(ProviderSettings);
		// config is auto-unwrapped on the setup proxy, so assign the object directly
		const wrapperVm = wrapper.vm as unknown as { config: { name: string; configured: boolean } };
		wrapperVm.config = { name: 'github', configured: true };
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('p')).toHaveLength(2);
		expect(wrapper.findAll('p')[0].text()).toBe('Provider: github');
		expect(wrapper.findAll('p')[1].text()).toBe('Status: Configured');
	});
});
