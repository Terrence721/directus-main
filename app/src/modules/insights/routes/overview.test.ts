import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

// Top-level mocks
interface Dashboard {
	id: string;
	name: string;
	description?: string;
}

const mockDashboards = ref<Dashboard[]>([]);

vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useInsightsStore: () => ({
			// The component does: dashboards.value = insightsStore.dashboards as unknown as Dashboard[]
			// So insightsStore.dashboards needs to be the actual array, not a ref
			dashboards: mockDashboards.value,
			hydrate: vi.fn().mockResolvedValue(undefined),
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

async function importOverview(): Promise<(typeof import('./overview.vue'))['default']> {
	return (await import('./overview.vue')).default;
}

describe('InsightsOverview', () => {
	it('mounts without crashing', async () => {
		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders insights heading', async () => {
		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		expect(wrapper.find('h1').text()).toBe('Insights');
	});

	it('shows create dashboard button', async () => {
		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		const createBtn = wrapper.find('button');
		expect(createBtn.exists()).toBe(true);
		expect(createBtn.text()).toBe('Create Dashboard');
	});

	it('shows loading state when loading', async () => {
		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = true;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').exists()).toBe(true);
		expect(wrapper.find('.loading').text()).toContain('Loading dashboards...');
	});

	it('shows empty state when no dashboards', async () => {
		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = false;
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty').exists()).toBe(true);
		expect(wrapper.find('.empty').text()).toContain('No dashboards yet');
	});

	it('renders dashboard list when dashboards exist', async () => {
		// Set the store's dashboards ref BEFORE mounting so onMounted gets the right data
		mockDashboards.value = [
			{ id: '1', name: 'Dashboard 1', description: 'Desc 1' },
			{ id: '2', name: 'Dashboard 2', description: '' },
		];

		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = false;

		// Wait for hydrate to complete and component to update
		await flushPromises();
		await wrapper.vm.$nextTick();

		// The component should now have the dashboards from the store
		console.log('HTML:', wrapper.html());
		console.log('Component dashboards:', (wrapper.vm as any).dashboards);
		console.log('Found dashboard items:', wrapper.findAll('.dashboard-item').length);

		const dashboardItems = wrapper.findAll('.dashboard-item');
		expect(dashboardItems).toHaveLength(2);
		expect(dashboardItems[0].text()).toContain('Dashboard 1');
		expect(dashboardItems[0].text()).toContain('Desc 1');
		expect(dashboardItems[1].text()).toContain('Dashboard 2');
		expect(dashboardItems[1].text()).toContain('No description');
	});

	it('navigates to edit dashboard when dashboard item clicked', async () => {
		// Set data before mounting
		mockDashboards.value = [{ id: '1', name: 'Dashboard 1', description: '' }];

		const InsightsOverview = await importOverview();
		const wrapper = mount(InsightsOverview);
		const wrapperVm = wrapper.vm as unknown as { loading: boolean };
		wrapperVm.loading = false;

		await flushPromises();
		await wrapper.vm.$nextTick();

		const dashboardItem = wrapper.find('.dashboard-item');
		if (dashboardItem.exists()) {
			await dashboardItem.element.click();
			await wrapper.vm.$nextTick();
		}

		expect(routerPushSpy).toHaveBeenCalledWith({
			name: 'insights-dashboard',
			params: { primaryKey: '1' },
		});
	});
});