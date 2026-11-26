import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routeParams = ref<Record<string, string>>({ primaryKey: 'dashboard1', panelKey: 'panel1' });
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
	useRoute: () => ({ params: routeParams.value }),
	useRouter: () => ({ push: routerPushSpy }),
}));

function seedDashboard(): void {
	mockDashboards.value = [
		{
			id: 'dashboard1',
			panels: [{ id: 'panel1', name: 'Panel 1', type: 'chart', config: { source: 'posts' } }],
		},
	];
}

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routeParams.value = { primaryKey: 'dashboard1', panelKey: 'panel1' };
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

	it('loads an existing panel and renders the form populated from the panel', async () => {
		seedDashboard();
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		expect(wrapper.find('.header h1').text()).toBe('Panel 1');
		expect(wrapper.find('.btn--primary').text()).toBe('Save');
		expect((wrapper.find('input.input').element as HTMLInputElement).value).toBe('Panel 1');
		expect((wrapper.find('select.select').element as HTMLSelectElement).value).toBe('chart');
		expect((wrapper.find('textarea.config').element as HTMLTextAreaElement).value).toBe(
			JSON.stringify({ source: 'posts' }, null, 2),
		);
	});

	it('initializes a fresh panel when panelKey is new', async () => {
		routeParams.value = { primaryKey: 'dashboard1', panelKey: 'new' };
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		expect(wrapper.find('.header h1').text()).toBe('New Panel');
		expect(wrapper.find('.btn--primary').text()).toBe('Create');
		expect((wrapper.find('input.input').element as HTMLInputElement).value).toBe('New Panel');
	});

	it('leaves the panel empty when the dashboard id is not found in the store', async () => {
		seedDashboard();
		routeParams.value = { primaryKey: 'other-dashboard', panelKey: 'panel1' };
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		// No matching dashboard → panel stays null → header falls back and form is blank
		expect(wrapper.find('.header h1').text()).toBe('New Panel');
		expect(wrapper.find('.form').exists()).toBe(true);
		expect((wrapper.find('input.input').element as HTMLInputElement).value).toBe('');
	});

	it('shows the loading state until the panel resolves', async () => {
		seedDashboard();
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').text()).toBe('Loading panel...');
		expect(wrapper.find('.form').exists()).toBe(false);
	});

	it('saves an existing panel with updatePanel and navigates to the dashboard', async () => {
		seedDashboard();
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		// Change the name, then save
		await wrapper.find('input.input').setValue('Renamed');
		await wrapper.find('.btn--primary').trigger('click');
		await flushPromises();

		expect(mockUpdatePanel).toHaveBeenCalledTimes(1);
		const updatedPanel = mockUpdatePanel.mock.calls[0][1] as {
			name: string;
			type: string;
			config: Record<string, unknown>;
		};
		expect(updatedPanel.name).toBe('Renamed');
		expect(updatedPanel.config).toEqual({ source: 'posts' });
		expect(routerPushSpy).toHaveBeenCalledWith({ name: 'insights-dashboard', params: { primaryKey: 'dashboard1' } });
	});

	it('creates a new panel with addPanel and navigates to the dashboard', async () => {
		routeParams.value = { primaryKey: 'dashboard1', panelKey: 'new' };
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		await wrapper.find('select.select').setValue('metric');
		await wrapper.find('textarea.config').setValue(JSON.stringify({ metric: 'views' }));
		await wrapper.find('.btn--primary').trigger('click');
		await flushPromises();

		expect(mockAddPanel).toHaveBeenCalledTimes(1);
		expect(mockUpdatePanel).not.toHaveBeenCalled();
		const newPanel = mockAddPanel.mock.calls[0][1] as { name: string; type: string; config: Record<string, unknown> };
		expect(newPanel.name).toBe('New Panel');
		expect(newPanel.type).toBe('metric');
		expect(newPanel.config).toEqual({ metric: 'views' });
	});

	it('does not save when no panel exists (e.g. key not found in the store)', async () => {
		mockDashboards.value = [];
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		await wrapper.find('.btn--primary').trigger('click');
		await flushPromises();

		expect(mockAddPanel).not.toHaveBeenCalled();
		expect(mockUpdatePanel).not.toHaveBeenCalled();
		expect(routerPushSpy).not.toHaveBeenCalled();
	});

	it('parses valid JSON entered into the configuration textarea', async () => {
		seedDashboard();
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		await wrapper.find('textarea.config').setValue('{"source": "users"}');
		await wrapper.find('.btn--primary').trigger('click');
		await flushPromises();

		const updatedPanel = mockUpdatePanel.mock.calls[0][1] as { config: Record<string, unknown> };
		expect(updatedPanel.config).toEqual({ source: 'users' });
	});

	it('falls back to an empty config object when the JSON is invalid', async () => {
		seedDashboard();
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		await wrapper.find('textarea.config').setValue('not json');
		await wrapper.find('.btn--primary').trigger('click');
		await flushPromises();

		const updatedPanel = mockUpdatePanel.mock.calls[0][1] as { config: Record<string, unknown> };
		expect(updatedPanel.config).toEqual({});
	});

	it('switches the panel type through the select', async () => {
		seedDashboard();
		const PanelConfiguration = await importPanelConfiguration();
		const wrapper = mount(PanelConfiguration);
		await flushPromises();

		await wrapper.find('select.select').setValue('table');
		await wrapper.find('.btn--primary').trigger('click');
		await flushPromises();

		const updatedPanel = mockUpdatePanel.mock.calls[0][1] as { type: string };
		expect(updatedPanel.type).toBe('table');
	});
});
