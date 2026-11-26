import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routeParams = ref<Record<string, string>>({ primaryKey: 'new' });
const mockDashboards = ref<unknown[]>([]);
const mockRefresh = vi.fn();
const mockAddDashboard = vi.fn();
const mockUpdateDashboard = vi.fn();

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useInsightsStore: () => ({
			dashboards: mockDashboards,
			refresh: mockRefresh,
			addDashboard: mockAddDashboard,
			updateDashboard: mockUpdateDashboard,
		}),
	};
});

const routerPushSpy = vi.fn();
vi.mock('vue-router', () => ({
	useRoute: () => ({
		params: routeParams.value,
	}),
	useRouter: () => ({
		push: routerPushSpy,
	}),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routeParams.value = { primaryKey: 'new' };
	mockDashboards.value = [];
	mockRefresh.mockReset();
	mockAddDashboard.mockReset();
	mockUpdateDashboard.mockReset();
	routerPushSpy.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importDashboard(): Promise<(typeof import('./dashboard.vue'))['default']> {
	return (await import('./dashboard.vue')).default;
}

type DashboardVm = { dashboard: { id: string; name: string; description: string; panels: unknown[] } | null };

describe('InsightsDashboard', () => {
	it('mounts without crashing', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders new dashboard header and Create button when primaryKey is new', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('h1').text()).toBe('New Dashboard');
		expect(wrapper.find('.btn--primary').text()).toBe('Create');
	});

	it('renders loading state', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').text()).toContain('Loading dashboard...');
	});

	it('shows empty panels state for new dashboard', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty').exists()).toBe(true);
		expect(wrapper.find('.empty').text()).toBe('No panels yet. Add your first panel.');
	});

	it('calls addDashboard and navigates to overview when saving a new dashboard', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as DashboardVm;
		wrapperVm.dashboard = {
			id: 'new',
			name: 'Test Dashboard',
			description: 'Test description',
			panels: [],
		};
		await wrapper.vm.$nextTick();

		await wrapper.find('.btn--primary').trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockAddDashboard).toHaveBeenCalledWith({
			id: 'new',
			name: 'Test Dashboard',
			description: 'Test description',
			panels: [],
		});
		expect(routerPushSpy).toHaveBeenCalledWith({ name: 'insights-overview' });
	});

	it('does not save when no dashboard object exists', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as DashboardVm;
		wrapperVm.dashboard = null;
		await wrapper.vm.$nextTick();

		await wrapper.find('.btn--primary').trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockAddDashboard).not.toHaveBeenCalled();
		expect(mockUpdateDashboard).not.toHaveBeenCalled();
	});

	it('loads an existing dashboard via store.refresh and renders its panels', async () => {
		routeParams.value = { primaryKey: 'dash-1' };
		mockDashboards.value = [
			{
				id: 'dash-1',
				name: 'Existing Dashboard',
				description: 'An existing dashboard',
				panels: [
					{ id: 'p1', name: 'Sales', type: 'chart', config: {} },
					{ id: 'p2', name: 'Signups', type: 'metric', config: { color: 'red' } },
				],
			},
		];
		mockRefresh.mockResolvedValue(undefined);

		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await flushPromises();

		expect(mockRefresh).toHaveBeenCalledWith('dash-1');
		expect(wrapper.find('h1').text()).toBe('Existing Dashboard');
		expect(wrapper.find('.btn--primary').text()).toBe('Save');

		const panelItems = wrapper.findAll('.panel-item');
		expect(panelItems).toHaveLength(2);
		expect(panelItems[0].find('.panel-name').text()).toBe('Sales');
		expect(panelItems[0].find('.panel-type').text()).toBe('chart');
		expect(panelItems[1].find('.panel-name').text()).toBe('Signups');
	});

	it('calls updateDashboard when saving an existing dashboard', async () => {
		routeParams.value = { primaryKey: 'dash-1' };
		mockDashboards.value = [
			{
				id: 'dash-1',
				name: 'Existing Dashboard',
				description: '',
				panels: [{ id: 'p1', name: 'Sales', type: 'chart', config: {} }],
			},
		];
		mockRefresh.mockResolvedValue(undefined);

		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await flushPromises();

		await wrapper.find('.btn--primary').trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockUpdateDashboard).toHaveBeenCalledTimes(1);
		expect(routerPushSpy).not.toHaveBeenCalled();
	});

	it('continues to render even when store.refresh throws', async () => {
		routeParams.value = { primaryKey: 'dash-1' };
		mockDashboards.value = [];
		mockRefresh.mockRejectedValue(new Error('network down'));

		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await flushPromises();

		// loading is cleared in finally; dashboard stays null so header falls back
		expect(wrapper.find('.loading').exists()).toBe(false);
		expect(wrapper.find('h1').text()).toBe('New Dashboard');
		expect(wrapper.find('.empty').exists()).toBe(true);
	});

	it('navigates to panel-detail when Add Panel is clicked', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await wrapper.vm.$nextTick();

		await wrapper.find('.panels .btn').trigger('click');
		await wrapper.vm.$nextTick();

		expect(routerPushSpy).toHaveBeenCalledWith({
			name: 'panel-detail',
			params: { primaryKey: 'new', panelKey: 'new' },
		});
	});

	it('does not navigate on Add Panel when no dashboard object exists', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as DashboardVm;
		wrapperVm.dashboard = null;
		await wrapper.vm.$nextTick();

		await wrapper.find('.panels .btn').trigger('click');
		await wrapper.vm.$nextTick();

		expect(routerPushSpy).not.toHaveBeenCalled();
	});

	it('applies description changes through the dashboardDescription setter', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		await wrapper.vm.$nextTick();

		await wrapper.find('textarea').setValue('Updated description');
		await wrapper.vm.$nextTick();

		const wrapperVm = wrapper.vm as unknown as DashboardVm;
		expect(wrapperVm.dashboard?.description).toBe('Updated description');
	});
});
