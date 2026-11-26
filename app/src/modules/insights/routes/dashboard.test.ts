import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const mockDashboards = ref([]);

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useInsightsStore: () => ({
			dashboards: mockDashboards,
			refresh: vi.fn(),
			addDashboard: vi.fn(),
			updateDashboard: vi.fn(),
		}),
	};
});

const routerPushSpy = vi.fn();
vi.mock('vue-router', () => ({
	useRoute: () => ({
		params: { primaryKey: 'new' },
	}),
	useRouter: () => ({
		push: routerPushSpy,
	}),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockDashboards.value = [];
	routerPushSpy.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importDashboard(): Promise<(typeof import('./dashboard.vue'))['default']> {
	return (await import('./dashboard.vue')).default;
}

describe('InsightsDashboard', () => {
	it('mounts without crashing', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders new dashboard header when primaryKey is new', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		expect(wrapper.find('h1').text()).toBe('New Dashboard');
	});

	it('renders loading state when loading', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').exists()).toBe(true);
		expect(wrapper.find('.loading').text()).toContain('Loading dashboard...');
	});

	it('renders save button with correct text when new', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const saveBtn = wrapper.find('button');
		expect(saveBtn.text()).toBe('Create');
	});

	it('calls addDashboard when saving new dashboard', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as {
			dashboard: { id: string; name: string; description: string; panels: [] } | null;
		};
		wrapperVm.dashboard = {
			id: 'new',
			name: 'Test Dashboard',
			description: 'Test description',
			panels: [],
		};

		const saveBtn = wrapper.find('button');
		await saveBtn.element.click();
		await wrapper.vm.$nextTick();

		const store = (wrapper.vm as unknown as { store: { addDashboard: ReturnType<typeof vi.fn> } }).store;
		expect(store.addDashboard).toHaveBeenCalledWith({
			id: 'new',
			name: 'Test Dashboard',
			description: 'Test description',
			panels: [],
		});
	});

	it('navigates to overview after saving new dashboard', async () => {
		const Dashboard = await importDashboard();
		const wrapper = mount(Dashboard);
		const wrapperVm = wrapper.vm as unknown as {
			dashboard: { id: string; name: string; description: string; panels: [] } | null;
		};
		wrapperVm.dashboard = {
			id: 'new',
			name: 'Test Dashboard',
			description: 'Test description',
			panels: [],
		};

		const saveBtn = wrapper.find('button');
		await saveBtn.element.click();
		await wrapper.vm.$nextTick();

		expect(routerPushSpy).toHaveBeenCalledWith({ name: 'insights-overview' });
	});
});
