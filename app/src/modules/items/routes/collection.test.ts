import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const mockCollections = ref([
	{
		collection: 'items',
		label: 'Items',
		fields: [
			{ name: 'id', type: 'string' },
			{ name: 'title', type: 'string' },
		],
	},
	{
		collection: 'posts',
		label: 'Posts',
		fields: [
			{ name: 'id', type: 'string' },
			{ name: 'title', type: 'string' },
		],
	},
]);
const mockCollectionsLoading = ref(false);

// Module-level refs driving the useItems mock (refs re-evaluate the component's computeds on change)
const mockItemsState = {
	data: ref<Record<string, unknown>[]>([]),
	total: ref(0),
	loading: ref(false),
	error: ref<Error | null>(null),
	page: ref(1),
};

const mockRefresh = vi.fn();
const mockSetPage = vi.fn();
const mockCreateItem = vi.fn();
const mockUpdateItem = vi.fn();
const mockDeleteItem = vi.fn();

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useItems: () => ({
			data: mockItemsState.data,
			total: mockItemsState.total,
			loading: mockItemsState.loading,
			error: mockItemsState.error,
			page: mockItemsState.page,
			limit: ref(10),
			offset: ref(0),
			refresh: mockRefresh,
			setPage: mockSetPage,
			createItem: mockCreateItem,
			updateItem: mockUpdateItem,
			deleteItem: mockDeleteItem,
		}),
		useCollections: () => ({
			data: mockCollections,
			loading: mockCollectionsLoading,
			error: ref(null),
			fetchCollections: vi.fn(),
			getCollection: vi.fn(),
		}),
	};
});

vi.mock('vue-router', () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockCollections.value = [
		{
			collection: 'items',
			label: 'Items',
			fields: [
				{ name: 'id', type: 'string' },
				{ name: 'title', type: 'string' },
			],
		},
		{
			collection: 'posts',
			label: 'Posts',
			fields: [
				{ name: 'id', type: 'string' },
				{ name: 'title', type: 'string' },
			],
		},
	];
	mockCollectionsLoading.value = false;
	mockItemsState.data.value = [];
	mockItemsState.total.value = 0;
	mockItemsState.loading.value = false;
	mockItemsState.error.value = null;
	mockItemsState.page.value = 1;
	mockRefresh.mockReset();
	mockSetPage.mockReset();
	mockCreateItem.mockReset();
	mockUpdateItem.mockReset();
	mockDeleteItem.mockReset();
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

	it('renders the heading from the first collection label', async () => {
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('h1').text()).toBe('Items');
	});

	it('shows the collections loading state in the sidebar', async () => {
		mockCollectionsLoading.value = true;
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-sidebar__loading').exists()).toBe(true);
	});

	it('shows the empty sidebar when there are no collections', async () => {
		mockCollections.value = [];
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-sidebar__empty').exists()).toBe(true);
		// Heading falls back to the raw collection name
		expect(wrapper.find('h1').text()).toBe('demo_items');
	});

	it('switches collections from the sidebar and marks the active item', async () => {
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		const items = wrapper.findAll('.coll-item');
		expect(items).toHaveLength(2);
		expect(wrapper.findAll('li')[0].classes()).toContain('active');

		await items[1].trigger('click');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('h1').text()).toBe('Posts');
		expect(wrapper.findAll('li')[1].classes()).toContain('active');
	});

	it('shows the items loading state', async () => {
		mockItemsState.loading.value = true;
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-loading').exists()).toBe(true);
	});

	it('shows the items error state', async () => {
		mockItemsState.error.value = new Error('Failed to load');
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-error').text()).toBe('Failed to load');
	});

	it('shows the empty state when there are no items', async () => {
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-empty').text()).toBe('No items found.');
	});

	it('renders item rows with values and dashes for missing fields', async () => {
		mockItemsState.data.value = [
			{ id: '1', title: 'Item 1' },
			{ id: '2', title: undefined },
		];
		mockItemsState.total.value = 2;
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		const rows = wrapper.findAll('.items-table tbody tr');
		expect(rows).toHaveLength(2);
		expect(rows[0].findAll('td')[1].text()).toBe('Item 1');
		expect(rows[1].findAll('td')[1].text()).toBe('-');
	});

	it('renders pagination and navigates with setPage', async () => {
		mockItemsState.data.value = [{ id: '1', title: 'Item 1' }];
		mockItemsState.total.value = 25;
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		const pagination = wrapper.find('.items-pagination');
		expect(pagination.text()).toContain('Page 1 of 3');
		const buttons = pagination.findAll('button');
		expect(buttons[0].attributes('disabled')).toBeDefined(); // Prev disabled on page 1

		await buttons[1].trigger('click');
		expect(mockSetPage).toHaveBeenCalledWith(2);

		// On the last page Next is disabled
		mockItemsState.page.value = 3;
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-pagination').findAll('button')[1].attributes('disabled')).toBeDefined();
	});

	it('creates an item via the create form and refreshes on success', async () => {
		mockCreateItem.mockResolvedValue({ id: '9', title: 'New' });
		mockRefresh.mockResolvedValue(undefined);
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		// Open the create form
		await wrapper.find('.items-header .btn').trigger('click');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.create-form').exists()).toBe(true);

		// The second field input is 'title' (fields are ['id', 'title'])
		await wrapper.findAll('.create-form__input')[1].setValue('New');
		await wrapper.findAll('.create-form__body')[0].trigger('submit');
		await wrapper.vm.$nextTick();

		expect(mockCreateItem).toHaveBeenCalledWith({ title: 'New' });
		expect(mockRefresh).toHaveBeenCalled();
		// Form closes on success
		expect(wrapper.find('.create-form').exists()).toBe(false);
	});

	it('shows the create error when createItem fails', async () => {
		mockCreateItem.mockRejectedValue(new Error('boom'));
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.find('.items-header .btn').trigger('click');
		await wrapper.vm.$nextTick();
		await wrapper.findAll('.create-form__body')[0].trigger('submit');
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.create-form__error').text()).toBe('boom');
		// Form stays open so the user can retry
		expect(wrapper.find('.create-form').exists()).toBe(true);

		// Cancel closes it
		await wrapper.find('.create-form__cancel').trigger('click');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.create-form').exists()).toBe(false);
	});

	it('edits an item and saves changes', async () => {
		mockItemsState.data.value = [{ id: '1', title: 'Item 1' }];
		mockItemsState.total.value = 1;
		mockUpdateItem.mockResolvedValue({ id: '1', title: 'Changed' });
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.find('.items-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.create-form h2').text()).toBe('Edit item');
		expect(wrapper.findAll('.items-table tbody tr')[0].classes()).toContain('items-table--editing');

		// The second field input is 'title' (fields are ['id', 'title'])
		await wrapper.findAll('.create-form__input')[1].setValue('Changed');
		await wrapper.findAll('.create-form__body')[0].trigger('submit');
		await wrapper.vm.$nextTick();

		expect(mockUpdateItem).toHaveBeenCalledWith('1', { id: '1', title: 'Changed' });
		// cancelEdit closes the edit form and un-highlights the row
		expect(wrapper.findAll('h2').map((h) => h.text())).not.toContain('Edit item');
		expect(wrapper.findAll('.items-table tbody tr')[0].classes()).not.toContain('items-table--editing');
	});

	it('keeps the edit form open when updateItem returns null', async () => {
		mockItemsState.data.value = [{ id: '1', title: 'Item 1' }];
		mockItemsState.total.value = 1;
		mockUpdateItem.mockResolvedValue(null);
		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.find('.items-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		await wrapper.findAll('.create-form__body')[0].trigger('submit');
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.create-form').exists()).toBe(true);
		expect(wrapper.find('.create-form h2').text()).toBe('Edit item');

		// The close button cancels the edit
		await wrapper.find('.create-form__close').trigger('click');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.create-form').exists()).toBe(false);
	});

	it('deletes an item on the last page and steps back a page', async () => {
		const confirmSpy = vi.fn(() => true);
		vi.stubGlobal('confirm', confirmSpy);

		mockItemsState.data.value = [{ id: '1', title: 'Last' }];
		mockItemsState.total.value = 1;
		mockItemsState.page.value = 2;
		mockDeleteItem.mockResolvedValue(true);

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.find('.items-action-btn--delete').trigger('click');
		await wrapper.vm.$nextTick();

		expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
		expect(mockDeleteItem).toHaveBeenCalledWith('1');
		// page > 1 and a single row → setPage back, no refresh
		expect(mockSetPage).toHaveBeenCalledWith(1);
		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it('deletes an item on page 1 and refreshes instead', async () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => true),
		);

		mockItemsState.data.value = [
			{ id: '1', title: 'One' },
			{ id: '2', title: 'Two' },
		];
		mockItemsState.total.value = 2;
		mockDeleteItem.mockResolvedValue(true);
		mockRefresh.mockResolvedValue(undefined);

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.findAll('.items-action-btn--delete')[0].trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockRefresh).toHaveBeenCalled();
		expect(mockSetPage).not.toHaveBeenCalled();
	});

	it('does nothing when the user declines the delete confirmation', async () => {
		const confirmSpy = vi.fn(() => false);
		vi.stubGlobal('confirm', confirmSpy);

		mockItemsState.data.value = [{ id: '1', title: 'One' }];
		mockItemsState.total.value = 1;

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.find('.items-action-btn--delete').trigger('click');
		await wrapper.vm.$nextTick();

		expect(confirmSpy).toHaveBeenCalled();
		expect(mockDeleteItem).not.toHaveBeenCalled();
		expect(mockRefresh).not.toHaveBeenCalled();
	});

	it('guards against deleting items without an id', async () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => true),
		);

		mockItemsState.data.value = [{ title: 'No id' }];
		mockItemsState.total.value = 1;

		const ItemsCollection = await importItemsCollection();
		const wrapper = mount(ItemsCollection);
		await wrapper.vm.$nextTick();

		await wrapper.find('.items-action-btn--delete').trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockDeleteItem).not.toHaveBeenCalled();
	});
});
