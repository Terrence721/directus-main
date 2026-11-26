import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const mockItemsState = vi.hoisted(() => ({
	data: [] as Record<string, unknown>[],
	total: 0,
	loading: false,
	error: null as Error | null,
}));

const routerPushSpy = vi.fn();

// Mock composables before importing the component
vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useItems: () => ({
			data: ref(mockItemsState.data),
			total: ref(mockItemsState.total),
			loading: ref(mockItemsState.loading),
			error: ref(mockItemsState.error),
			refresh: vi.fn(),
			limit: ref(10),
			offset: ref(0),
			page: ref(1),
		}),
		useCollections: () => ({
			data: ref([{ collection: 'items', label: 'Items', fields: [{ name: 'id', type: 'string' }, { name: 'title', type: 'string' }, { name: 'status', type: 'string' }] }]),
			loading: ref(false),
			error: ref(null),
			fetchCollections: vi.fn(),
			getCollection: vi.fn(),
		}),
	};
});

vi.mock('vue-router', () => ({
	useRouter: () => ({
		push: routerPushSpy,
	}),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockItemsState.data = [];
	mockItemsState.total = 0;
	mockItemsState.loading = false;
	mockItemsState.error = null;
	routerPushSpy.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importItemsCollection(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

describe('ItemsCollection', () => {
	it('mounts without crashing', async () => {
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders items heading', async () => {
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		expect(wrapper.find('h1').text()).toBe('Items');
	});

	it('shows loading state when fetching items', async () => {
		mockItemsState.loading = true;
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.items-loading').exists()).toBe(true);
		expect(wrapper.find('.items-loading').text()).toContain('Loading...');
	});

	it('shows error state when fetch fails', async () => {
		mockItemsState.error = new Error('Failed to load');
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.items-error').exists()).toBe(true);
		expect(wrapper.find('.items-error').text()).toContain('Failed to load');
	});

	it('shows empty state when no items', async () => {
		mockItemsState.data = [];
		mockItemsState.total = 0;
		mockItemsState.loading = false;
		mockItemsState.error = null;
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.items-empty').exists()).toBe(true);
		expect(wrapper.find('.items-empty').text()).toContain('No items found.');
	});

	it('renders item table when items exist', async () => {
		mockItemsState.data = [
			{ id: '1', title: 'Item 1', status: 'published' },
			{ id: '2', title: 'Item 2', status: 'draft' },
		];
		mockItemsState.total = 2;
		mockItemsState.loading = false;
		mockItemsState.error = null;

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		const rows = wrapper.findAll('tbody tr');
		expect(rows).toHaveLength(2);
		// Component renders row[field] ?? '-', fields are 'id', 'title', 'status'
		// The component uses field names as headers: 'id', 'title', 'status'
		expect(rows[0].findAll('td')[0].text()).toBe('1');
		expect(rows[0].findAll('td')[1].text()).toBe('Item 1');
		expect(rows[0].findAll('td')[2].text()).toBe('published');
		expect(rows[1].findAll('td')[0].text()).toBe('2');
		expect(rows[1].findAll('td')[1].text()).toBe('Item 2');
		expect(rows[1].findAll('td')[2].text()).toBe('draft');
	});

	it('shows pagination when items exist', async () => {
		mockItemsState.data = [{ id: '1', title: 'Item 1' }];
		mockItemsState.total = 25;
		mockItemsState.loading = false;
		mockItemsState.error = null;

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.items-pagination').exists()).toBe(true);
		expect(wrapper.find('.items-pagination').text()).toContain('Prev');
		expect(wrapper.find('.items-pagination').text()).toContain('Page 1 of 3');
		expect(wrapper.find('.items-pagination').text()).toContain('Next');
	});

	it('puts row into edit mode when edit button clicked', async () => {
		mockItemsState.data = [{ id: '1', title: 'Item 1' }];
		mockItemsState.total = 1;
		mockItemsState.loading = false;
		mockItemsState.error = null;

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		const editBtn = wrapper.find('.items-action-btn');
		expect(editBtn.exists()).toBe(true);
		await editBtn.element.click();

		const wrapperVm = wrapper.vm as { editingItemId: string | null };
		expect(wrapperVm.editingItemId).toBe('1');
	});
});
