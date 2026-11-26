import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

// Top-level mocks
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

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importOverview(): Promise<(typeof import('./overview.vue'))['default']> {
	return (await import('./overview.vue')).default;
}

describe('DeploymentOverview', () => {
	it('mounts without crashing', async () => {
		const DeploymentOverview = await importOverview();
		const wrapper = mount(DeploymentOverview);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders deployments heading', async () => {
		const DeploymentOverview = await importOverview();
		const wrapper = mount(DeploymentOverview);
		expect(wrapper.find('h1').text()).toBe('Deployments');
	});

	it('shows loading state when loading', async () => {
		const DeploymentOverview = await importOverview();
		const wrapper = mount(DeploymentOverview);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').exists()).toBe(true);
		expect(wrapper.find('.loading').text()).toContain('Loading...');
	});

	it('shows provider list when providers exist', async () => {
		const DeploymentOverview = await importOverview();
		const wrapper = mount(DeploymentOverview);
		const wrapperVm = wrapper.vm as unknown as {
			providers: Array<{ provider: string; configured: boolean }>;
			loading: boolean;
		};
		wrapperVm.providers = [
			{ provider: 'github', configured: true },
			{ provider: 'gitlab', configured: false },
		];
		await wrapper.vm.$nextTick();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await wrapper.vm.$nextTick();

		const providerItems = wrapper.findAll('.provider-item');
		expect(providerItems).toHaveLength(2);
		expect(providerItems[0].text()).toContain('github');
		expect(providerItems[0].text()).toContain('Configured');
		expect(providerItems[1].text()).toContain('gitlab');
		expect(providerItems[1].text()).toContain('Not configured');
	});

	it('shows add provider button', async () => {
		const DeploymentOverview = await importOverview();
		const wrapper = mount(DeploymentOverview);
		await wrapper.vm.$nextTick();

		const addBtn = wrapper.find('button');
		expect(addBtn.exists()).toBe(true);
		expect(addBtn.text()).toBe('Add Provider');
	});

	it('sets selectedProvider when add provider button clicked', async () => {
		const DeploymentOverview = await importOverview();
		const wrapper = mount(DeploymentOverview);
		const wrapperVm = wrapper.vm as unknown as { selectedProvider: string | null };

		expect(wrapperVm.selectedProvider).toBeNull();

		const addBtn = wrapper.find('button');
		await addBtn.element.click();
		expect(wrapperVm.selectedProvider).toBe('github');
	});
});
