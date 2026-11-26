import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routeParams = ref<Record<string, string>>({ id: '1' });
const routerPushSpy = vi.fn();
const mockCollections = ref([
	{ collection: 'demo_items', label: 'Demo Items', fields: [{ name: 'id' }, { name: 'title' }] },
]);
const mockCollectionsLoading = ref(false);
const mockDeleteItem = vi.fn();

vi.mock('vue-router', () => ({
	useRoute: () => ({ params: routeParams.value }),
	useRouter: () => ({ push: routerPushSpy }),
}));

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useCollections: () => ({
			data: mockCollections,
			loading: mockCollectionsLoading,
			error: ref(null),
		}),
		useItems: () => ({ deleteItem: mockDeleteItem }),
		resolveApiBaseUrl: () => 'http://localhost:8055',
	};
});

let currentData: Record<string, unknown> | null = { id: '1', title: 'Hello' };
let itemsFail = false;
let pendingItems = false;

window.fetch = vi.fn((input: RequestInfo | URL) => {
	const url = String(input);
	if (url.includes('/items/')) {
		if (pendingItems) return new Promise(() => {});
		if (itemsFail) {
			return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
		}
		return Promise.resolve({ ok: true, json: async () => ({ data: currentData }) });
	}
	return Promise.resolve({ ok: true, json: async () => ({}) });
});

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routeParams.value = { id: '1' };
	mockCollections.value = [
		{ collection: 'demo_items', label: 'Demo Items', fields: [{ name: 'id' }, { name: 'title' }] },
	];
	mockCollectionsLoading.value = false;
	currentData = { id: '1', title: 'Hello' };
	itemsFail = false;
	pendingItems = false;
	mockDeleteItem.mockClear();
	routerPushSpy.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importItemsDetail(): Promise<(typeof import('./detail.vue'))['default']> {
	return (await import('./detail.vue')).default;
}

describe('ItemsDetail', () => {
	it('mounts without crashing', async () => {
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders the detail card with collection meta and item fields', async () => {
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		expect(window.fetch).toHaveBeenCalledWith('http://localhost:8055/items/demo_items/1');
		expect(wrapper.find('.detail-card').exists()).toBe(true);

		const meta = wrapper.findAll('.meta-item');
		expect(meta[0].text()).toBe('Collection: demo_items');
		expect(meta[1].text()).toBe('ID: 1');

		const fields = wrapper.findAll('.detail-field');
		expect(fields[0].find('.detail-field-label').text()).toBe('id');
		expect(fields[0].find('.detail-field-value').text()).toBe('1');
		expect(fields[1].find('.detail-field-label').text()).toBe('title');
		expect(fields[1].find('.detail-field-value').text()).toBe('Hello');
	});

	it('shows a dash for null or missing field values', async () => {
		currentData = { id: '1', title: null };
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		const fields = wrapper.findAll('.detail-field');
		expect(fields[1].find('.detail-field-value').text()).toBe('—');
	});

	it('shows the collections loading state in the sidebar', async () => {
		mockCollectionsLoading.value = true;
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.detail-loading').text()).toBe('Loading collections...');
	});

	it('shows the no-collections empty state', async () => {
		mockCollections.value = [];
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.detail-empty').text()).toBe('No collections available.');
		// Without a collection, no item fetch happens at all
		const fetchMock = window.fetch as unknown as { mock: { calls: unknown[][] } };
		expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('/items/'))).toBe(false);
	});

	it('shows the item loading state while the fetch is pending', async () => {
		pendingItems = true;
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.detail-loading').text()).toBe('Loading item...');
	});

	it('shows the item error state on a 404', async () => {
		itemsFail = true;
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		expect(wrapper.find('.detail-error').text()).toBe('Item not found (404)');
	});

	it('shows the item not found empty state when data is null', async () => {
		currentData = null;
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		expect(wrapper.find('.detail-empty').text()).toBe('Item not found.');
	});

	it('navigates back to the items list from the back button', async () => {
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		await wrapper.find('.back-btn').trigger('click');
		expect(routerPushSpy).toHaveBeenCalledWith('/items');
	});

	it('navigates to the edit view from the Edit button', async () => {
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		await wrapper.find('.btn-edit').trigger('click');
		expect(routerPushSpy).toHaveBeenCalledWith('/items?edit=1');
	});

	it('deletes the item when confirmed and navigates to the list', async () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => true),
		);
		mockDeleteItem.mockResolvedValue(true);

		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		await wrapper.find('.btn-delete').trigger('click');
		await flushPromises();

		expect(mockDeleteItem).toHaveBeenCalledWith('1');
		expect(routerPushSpy).toHaveBeenCalledWith('/items');
	});

	it('does not delete when the confirmation is declined', async () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => false),
		);
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		await wrapper.find('.btn-delete').trigger('click');
		await flushPromises();

		expect(mockDeleteItem).not.toHaveBeenCalled();
		expect(routerPushSpy).not.toHaveBeenCalled();
	});

	it('skips deletion when the item id is empty', async () => {
		routeParams.value = { id: '' };
		vi.stubGlobal(
			'confirm',
			vi.fn(() => true),
		);
		const ItemsDetail = await importItemsDetail();
		const wrapper = mount(ItemsDetail);
		await flushPromises();

		await wrapper.find('.btn-delete').trigger('click');
		await flushPromises();

		expect(mockDeleteItem).not.toHaveBeenCalled();
	});
});
