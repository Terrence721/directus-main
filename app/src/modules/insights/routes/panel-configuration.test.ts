import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();
const mockDashboards = ref<
	{
		id: string;
		panels: { id: string; name: string; type: string; config: Record<string, unknown> }[];
	}[]
>([]);
const mockAddPanel = vi.fn();
const mockUpdatePanel = vi.fn();

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useInsightsStore: () => ({
			dashboards: mockDashboards,
			addPanel: mockAddPanel,
			updatePanel: mockUpdatePanel,
		}),
	};
});

vi.mock('vue-router', () => ({
	useRoute: () => ({
		params: { primaryKey: 'dashboard1', panelKey: 'panel1' },
	}),
	useRouter: () => ({ push: routerPushSpy }),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routerPushSpy.mockClear();
	mockDashboards.value = [];
	mockAddPanel.mockClear();
	mockUpdatePanel.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importPanelConfiguration(): Promise<(typeof import('./panel-configuration.vue'))['default']> {
	return (await import('./panel-configuration.vue')).default;
}

describe('PanelConfiguration', () => {
	it('mounts without crashing', async () => {
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders panel configuration header', async () => {
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		expect(wrapper.find('.header h1').text()).toBe('New Panel');
	});

	it('shows loading state when loading', async () => {
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').exists()).toBe(true);
		expect(wrapper.find('.loading').text()).toBe('Loading panel...');
	});

	it('displays form fields when not loading', async () => {
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.form').exists()).toBe(true);
		expect(wrapper.findAll('.form-group')).toHaveLength(3);
		// Labels are inside form-group divs, so find all labels within form
		const labels = wrapper.findAll('.form-group label');
		expect(labels[0].text()).toBe('Panel Name');
		expect(labels[1].text()).toBe('Panel Type');
		expect(labels[2].text()).toBe('Configuration');
	});

	it('displays save button for existing panel', async () => {
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean; panelId: string };
		wrapperVm.loading = false;
		wrapperVm.panelId = 'panel1';
		await wrapper.vm.$nextTick();

		const button = wrapper.find('.btn--primary');
		expect(button.exists()).toBe(true);
		expect(button.text()).toBe('Save');
	});

	it('displays create button for new panel', async () => {
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean; panelId: string };
		wrapperVm.loading = false;
		wrapperVm.panelId = 'new';
		await wrapper.vm.$nextTick();

		const button = wrapper.find('.btn--primary');
		expect(button.exists()).toBe(true);
		expect(button.text()).toBe('Create');
	});

	it('saves panel and redirects to dashboard', async () => {
		// Seed the store so onMounted can load the panel by key
		mockDashboards.value = [
			{
				id: 'dashboard1',
				panels: [{ id: 'panel1', name: 'Panel 1', type: 'chart', config: {} }],
			},
		];
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await wrapper.vm.$nextTick();

		const saveButton = wrapper.find('.btn--primary');
		await saveButton.trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockUpdatePanel).toHaveBeenCalled();
		expect(routerPushSpy).toHaveBeenCalledWith({ name: 'insights-dashboard', params: { primaryKey: 'dashboard1' } });
	});
});
