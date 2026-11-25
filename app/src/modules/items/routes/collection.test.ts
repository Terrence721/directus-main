import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, shallowRef } from 'vue';
import ItemsCollection from './collection.vue';

// Create persistent mock refs for useItems and useCollections
const collectionsData = ref([
	{ collection: 'demo_items', label: 'Demo Items', fields: [{ name: 'id' }, { name: 'title' }, { name: 'content' }] },
	{ collection: 'posts', label: 'Posts', fields: [{ name: 'id' }, { name: 'title' }, { name: 'body' }] },
]);
const collectionsLoading = ref(false);

// Single shared items instance for the component to use
// This must be a ref because the component's itemsInstance is a ref
const sharedItemsInstance = shallowRef({
	data: ref([
		{ id: '1', title: 'Item 1', content: 'Content 1' },
		{ id: '2', title: 'Item 2', content: 'Content 2' },
	]),
	loading: ref(false),
	error: ref<Error | null>(null),
	total: ref(2),
	page: ref(1),
	limit: ref(10),
	refresh: vi.fn().mockResolvedValue(undefined),
	setPage: vi.fn(),
	setLimit: vi.fn(),
	createItem: vi.fn().mockResolvedValue({ id: '3', title: 'New', content: 'New' }),
	updateItem: vi.fn().mockResolvedValue({ id: '1', title: 'Updated', content: 'Updated' }),
	deleteItem: vi.fn().mockResolvedValue(true),
});

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useCollections: () => ({
			data: collectionsData,
			loading: collectionsLoading,
		}),
		useItems: () => sharedItemsInstance.value,
	};
});

beforeEach(() => {
	vi.clearAllMocks();
	setActivePinia(createPinia());
	collectionsData.value = [
		{ collection: 'demo_items', label: 'Demo Items', fields: [{ name: 'id' }, { name: 'title' }, { name: 'content' }] },
		{ collection: 'posts', label: 'Posts', fields: [{ name: 'id' }, { name: 'title' }, { name: 'body' }] },
	];
	collectionsLoading.value = false;
	// Reset shared instance values
	sharedItemsInstance.value = {
		data: ref([
			{ id: '1', title: 'Item 1', content: 'Content 1' },
			{ id: '2', title: 'Item 2', content: 'Content 2' },
		]),
		loading: ref(false),
		error: ref<Error | null>(null),
		total: ref(2),
		page: ref(1),
		limit: ref(10),
		refresh: vi.fn().mockResolvedValue(undefined),
		setPage: vi.fn(),
		setLimit: vi.fn(),
		createItem: vi.fn().mockResolvedValue({ id: '3', title: 'New', content: 'New' }),
		updateItem: vi.fn().mockResolvedValue({ id: '1', title: 'Updated', content: 'Updated' }),
		deleteItem: vi.fn().mockResolvedValue(true),
	};
	globalThis.fetch = vi.fn();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('ItemsCollection', () => {
	it('mounts without crashing', () => {
		const wrapper = mount(ItemsCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders sidebar with collections', async () => {
		const wrapper = mount(ItemsCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.items-sidebar').exists()).toBe(true);
		expect(wrapper.find('.items-sidebar h2').text()).toBe('Collections');
		expect(wrapper.findAll('.coll-item')).toHaveLength(2);
		expect(wrapper.findAll('.coll-item')[0].text()).toBe('Demo Items');
		expect(wrapper.findAll('.coll-item')[1].text()).toBe('Posts');
	});

	it('shows loading state in sidebar', async () => {
		collectionsLoading.value = true;

		const wrapper = mount(ItemsCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.items-sidebar__loading').exists()).toBe(true);
		expect(wrapper.find('.items-sidebar__loading').text()).toBe('Loading...');
	});

	it('shows empty state in sidebar when no collections', async () => {
		collectionsData.value = [];
		collectionsLoading.value = false;

		const wrapper = mount(ItemsCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.items-sidebar__empty').exists()).toBe(true);
		expect(wrapper.find('.items-sidebar__empty').text()).toBe('No collections');
	});

	it('renders main content with collection label', async () => {
		const wrapper = mount(ItemsCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.items-main').exists()).toBe(true);
		expect(wrapper.find('.items-header h1').text()).toBe('Demo Items');
	});

	it('renders Create button in header', async () => {
		const wrapper = mount(ItemsCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const createBtn = wrapper.find('.items-header .btn');
		expect(createBtn.exists()).toBe(true);
		expect(createBtn.text()).toBe('Create');
	});

	// Helper to mount the component after its mounted initialization has completed.
	async function mountWithInstance() {
		const wrapper = mount(ItemsCollection);
		await new Promise((resolve) => setTimeout(resolve, 100));
		await wrapper.vm.$nextTick();
		return wrapper;
	}

	it('opens create form when Create button clicked', async () => {
		const wrapper = await mountWithInstance();

		await wrapper.find('.items-header .btn').trigger('click');

		expect(wrapper.find('.create-form').exists()).toBe(true);
		expect(wrapper.find('.create-form__header h2').text()).toBe('Create item');
		expect(wrapper.findAll('.create-form__field')).toHaveLength(3); // id, title, content
	});

	it('closes create form when cancel clicked', async () => {
		const wrapper = await mountWithInstance();

		await wrapper.find('.items-header .btn').trigger('click');
		await wrapper.find('.create-form__cancel').trigger('click');

		expect(wrapper.find('.create-form').exists()).toBe(false);
	});

	it('creates item after submitting the create form', async () => {
		const wrapper = await mountWithInstance();

		await wrapper.find('.items-header .btn').trigger('click');

		// Fill form
		const inputs = wrapper.findAll('.create-form__input');
		await inputs[0].setValue('3');
		await inputs[1].setValue('New Item');
		await inputs[2].setValue('New Content');

		// Call handleCreate directly like the other test does
		const vm = wrapper.vm as unknown as { handleCreate: () => Promise<void> };
		await vm.handleCreate();

		await vi.waitFor(() => {
			expect(sharedItemsInstance.value.createItem).toHaveBeenCalled();
		});
	});

	it('sets editingItemId when startEdit is called', async () => {
		const wrapper = await mountWithInstance();

		const vm = wrapper.vm as unknown as { startEdit: (row: Record<string, unknown>) => void };
		vm.startEdit({ id: '1', title: 'Item 1', content: 'Content 1' });

		expect((wrapper.vm as unknown as { editingItemId: string | null }).editingItemId).toBe('1');
	});

	it('updates editingForm when startEdit is called', async () => {
		const wrapper = await mountWithInstance();

		const vm = wrapper.vm as unknown as { startEdit: (row: Record<string, unknown>) => void };
		vm.startEdit({ id: '1', title: 'Test Title', content: 'Test Content' });

		expect((wrapper.vm as unknown as { editingForm: Record<string, unknown> }).editingForm).toEqual({
			id: '1',
			title: 'Test Title',
			content: 'Test Content',
		});
	});

	it('resets editingItemId when cancelEdit is called', async () => {
		const wrapper = await mountWithInstance();

		const vm = wrapper.vm as unknown as { startEdit: (row: Record<string, unknown>) => void };
		vm.startEdit({ id: '1', title: 'Item 1', content: 'Content 1' });
		expect((wrapper.vm as unknown as { editingItemId: string | null }).editingItemId).toBe('1');

		const vmCancel = wrapper.vm as unknown as { cancelEdit: () => void };
		vmCancel.cancelEdit();
		expect((wrapper.vm as unknown as { editingItemId: string | null }).editingItemId).toBeNull();
	});

	it('clears editingError when startEdit is called', async () => {
		const wrapper = await mountWithInstance();

		// Set an error first
		(wrapper.vm as unknown as { editingError: Error | null }).editingError = new Error('Some error');

		const vm = wrapper.vm as unknown as { startEdit: (row: Record<string, unknown>) => void };
		vm.startEdit({ id: '1', title: 'Item 1', content: 'Content 1' });

		expect((wrapper.vm as unknown as { editingError: Error | null }).editingError).toBeNull();
	});

	it('deletes item when handleDelete called with valid ID and confirmed', async () => {
		const wrapper = await mountWithInstance();

		vi.stubGlobal('confirm', () => true);

		const vm = wrapper.vm as unknown as { handleDelete: (id: string) => Promise<void> };
		await vm.handleDelete('1');
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(sharedItemsInstance.value.deleteItem).toHaveBeenCalledWith('1');
	});

	it('does not delete when confirm returns false', async () => {
		const wrapper = await mountWithInstance();

		vi.stubGlobal('confirm', () => false);

		const vm = wrapper.vm as unknown as { handleDelete: (id: string) => Promise<void> };
		await vm.handleDelete('1');
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(sharedItemsInstance.value.deleteItem).not.toHaveBeenCalled();
	});

	it('skips deletion when ID is empty', async () => {
		const wrapper = await mountWithInstance();

		const vm = wrapper.vm as unknown as { handleDelete: (id: string) => Promise<void> };
		await vm.handleDelete('');
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(sharedItemsInstance.value.deleteItem).not.toHaveBeenCalled();
	});

	it('skips deletion when ID is falsy', async () => {
		const wrapper = await mountWithInstance();

		const vm = wrapper.vm as unknown as { handleDelete: (id: string) => Promise<void> };
		await vm.handleDelete(null as unknown as string);
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(sharedItemsInstance.value.deleteItem).not.toHaveBeenCalled();
	});

	it('switches collection when clicking sidebar item', async () => {
		const wrapper = await mountWithInstance();

		await new Promise((resolve) => setTimeout(resolve, 50));

		// Click on second collection (Posts)
		await wrapper.findAll('.coll-item')[1].trigger('click');
		await new Promise((resolve) => setTimeout(resolve, 100));

		expect(wrapper.find('.items-header h1').text()).toBe('Posts');
	});

	it('rowKey function generates correct keys for string IDs', () => {
		const wrapper = mount(ItemsCollection);
		const vm = wrapper.vm as unknown as { rowKey: (row: unknown, index: number) => string };

		expect(vm.rowKey({ id: '123' }, 0)).toBe('id:string:123');
	});

	it('rowKey function generates correct keys for numeric IDs', () => {
		const wrapper = mount(ItemsCollection);
		const vm = wrapper.vm as unknown as { rowKey: (row: unknown, index: number) => string };

		expect(vm.rowKey({ id: 456 }, 1)).toBe('id:number:456');
	});

	it('rowKey function falls back to index for rows without id', () => {
		const wrapper = mount(ItemsCollection);
		const vm = wrapper.vm as unknown as { rowKey: (row: unknown, index: number) => string };

		expect(vm.rowKey({ foo: 'bar' }, 2)).toBe('index:2');
	});

	it('clearForm resets all form state', async () => {
		const wrapper = await mountWithInstance();

		await wrapper.find('.items-header .btn').trigger('click');

		const vm = wrapper.vm as unknown as {
			newItemForm: Record<string, unknown>;
			creating: boolean;
			creatingItem: boolean;
			createError: Error | null;
			clearForm: () => void;
		};

		vm.newItemForm = { id: '1', title: 'Test' };
		vm.creating = true;
		vm.creatingItem = true;
		vm.createError = new Error('Test error');

		vm.clearForm();

		expect(vm.newItemForm).toEqual({});
		expect(vm.creating).toBe(false);
		expect(vm.creatingItem).toBe(false);
		expect(vm.createError).toBeNull();
	});

	it('handles fetch error in handleCreate', async () => {
		const wrapper = await mountWithInstance();

		// Simulate an error in createItem
		sharedItemsInstance.value.createItem.mockRejectedValueOnce(new Error('Server error'));

		await wrapper.find('.items-header .btn').trigger('click');

		const inputs = wrapper.findAll('.create-form__input');
		await inputs[0].setValue('3');
		await inputs[1].setValue('New Item');
		await inputs[2].setValue('New Content');

		// Call handleCreate directly like the other test does
		const vm = wrapper.vm as unknown as { handleCreate: () => Promise<void> };
		await vm.handleCreate();

		await vi.waitFor(() => {
			const createError = (wrapper.vm as unknown as { createError: Error | null }).createError;
			expect(createError).toBeInstanceOf(Error);
			expect(createError!.message).toBe('Server error');
		});
	});
});
