import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed } from 'vue';

const routerPushSpy = vi.fn();
const mockActiveCollection = ref('');
const mockCollapsedGroups = ref(new Set<string>());
const mockToggleGroup = vi.fn();

vi.mock('../composables/use-collections-manager.js', () => ({
	useCollectionsManager: () => ({
		flatCollections: computed(() => mockFlatCollections.value),
		loading: mockLoading,
		error: ref(null),
		fetchCollections: mockFetchCollections,
	}),
}));

vi.mock('../composables/use-navigation.js', () => ({
	useNavigation: () => ({
		activeCollection: mockActiveCollection,
		collapsedGroups: mockCollapsedGroups,
		toggleGroup: mockToggleGroup,
	}),
}));

vi.mock('vue-router', () => ({
	useRouter: () => ({ push: routerPushSpy }),
}));

const mockFlatCollections = ref<{ collection: string; label: string; meta?: { group?: string } }[]>([]);
const mockLoading = ref(false);
const mockFetchCollections = vi.fn();

const mockFields = [
	{ name: 'title', type: 'string' },
	{ name: 'views', type: 'integer' },
];

let currentItems = { data: [{ id: '1', title: 'Hello', views: 5 }], total_count: 2 };
let itemsFail = false;

window.fetch = vi.fn((input: RequestInfo | URL) => {
	const url = String(input);
	if (url.includes('/collections/')) {
		return Promise.resolve({ ok: true, json: async () => ({ data: { fields: mockFields } }) });
	}
	if (url.includes('/items/')) {
		if (itemsFail) {
			return Promise.resolve({ ok: false, status: 500, json: async () => ({}) });
		}
		return Promise.resolve({ ok: true, json: async () => currentItems });
	}
	return Promise.resolve({ ok: true, json: async () => ({}) });
}) as unknown as typeof window.fetch;

async function activateCollection(value: string): Promise<void> {
	mockActiveCollection.value = value;
	await flushPromises();
}

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockFlatCollections.value = [];
	mockLoading.value = false;
	mockActiveCollection.value = '';
	mockCollapsedGroups.value = new Set();
	routerPushSpy.mockClear();
	currentItems = { data: [{ id: '1', title: 'Hello', views: 5 }], total_count: 2 };
	itemsFail = false;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importContentCollection(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

describe('ContentCollection', () => {
	it('mounts without crashing', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders the collections sidebar heading', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		expect(wrapper.find('.sidebar__header h2').text()).toBe('Collections');
	});

	it('shows loading state when collections are loading', async () => {
		const ContentCollection = await importContentCollection();
		mockLoading.value = true;
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		const refresh = wrapper.find('.btn-refresh');
		expect(refresh.attributes('disabled')).toBeDefined();
		expect(refresh.text()).toBe('Loading...');
	});

	it('shows empty state when no collections', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty-state').exists()).toBe(true);
		expect(wrapper.find('.empty-state').text()).toContain('No collections yet');
	});

	it('renders nav items and navigates via navigateTo on click', async () => {
		const ContentCollection = await importContentCollection();
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts' },
			{ collection: 'users', label: 'Users' },
		];
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		const navItems = wrapper.findAll('.nav-item');
		expect(navItems).toHaveLength(2);
		expect(navItems[0].text()).toContain('Posts');

		await navItems[0].find('.nav-btn').trigger('click');
		expect(mockActiveCollection.value).toBe('posts');
		expect(routerPushSpy).toHaveBeenCalledWith('/#/content/posts');
		await flushPromises();
	});

	it('groups collections by meta.group and toggles group collapse', async () => {
		const ContentCollection = await importContentCollection();
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts', meta: { group: 'Content' } },
			{ collection: 'images', label: 'Images', meta: { group: 'Media' } },
			{ collection: 'users', label: 'Users' },
		];
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.findAll('.nav-group')).toHaveLength(2);
		expect(wrapper.findAll('.nav-item')).toHaveLength(1); // ungrouped 'users'

		const groups = wrapper.findAll('.nav-group-header');
		await groups[0].trigger('click');
		expect(mockToggleGroup).toHaveBeenCalledWith('Content');

		// Collapsing a group hides its nested items
		mockCollapsedGroups.value = new Set(['Media']);
		await wrapper.vm.$nextTick();
		expect(wrapper.findAll('.nav-group-items')).toHaveLength(1);
	});

	it('shows no-collection prompt when no collection is active', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.no-collection').exists()).toBe(true);
		expect(wrapper.find('.no-collection').text()).toContain('Select a collection');
	});

	it('shows the items table, header, and rows when a collection is active', async () => {
		const ContentCollection = await importContentCollection();
		mockFlatCollections.value = [{ collection: 'posts', label: 'Blog Posts' }];
		const wrapper = mount(ContentCollection);
		await activateCollection('posts');

		// getCollectionLabel falls back to the raw name when no label is found
		expect(wrapper.find('.header__title').text()).toBe('Blog Posts');
		expect(wrapper.find('.items-table').exists()).toBe(true);

		const headers = wrapper.findAll('.items-table thead th');
		expect(headers[0].text()).toBe('title');
		expect(headers[1].text()).toBe('views');
		expect(headers[2].text()).toBe('Actions');

		const row = wrapper.find('.items-table tbody tr');
		expect(row.findAll('td')[0].text()).toBe('Hello');
		expect(row.findAll('td')[1].text()).toBe('5');

		// Edit button and row cell clicks both use goToDetail
		await row.find('.btn-edit').trigger('click');
		expect(routerPushSpy).toHaveBeenCalledWith('/#/content/posts/1');

		await row.find('td').trigger('click');
		expect(routerPushSpy).toHaveBeenLastCalledWith('/#/content/posts/1');
	});

	it('supports th-click sorting for non-string fields and direction toggle', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await activateCollection('posts');

		// Clicking the integer column sets sortField to 'views' and toggles direction to desc
		await wrapper.findAll('.items-table thead th')[1].trigger('click');
		await flushPromises();
		expect((wrapper.find('.sort-select').element as HTMLSelectElement).value).toBe('views');
		expect(wrapper.find('.sort-dir-btn').text()).toBe('↓');

		// String columns are not sortable and leave the sort untouched
		await wrapper.findAll('.items-table thead th')[0].trigger('click');
		await flushPromises();
		expect((wrapper.find('.sort-select').element as HTMLSelectElement).value).toBe('views');
		expect(wrapper.find('.sort-dir-btn').text()).toBe('↓');

		// Direction button toggles desc → asc
		await wrapper.find('.sort-dir-btn').trigger('click');
		await flushPromises();
		expect(wrapper.find('.sort-dir-btn').text()).toBe('↑');
	});

	it('supports search, sort-select, and reset controls', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await activateCollection('posts');

		await wrapper.find('.search-input').setValue('hello');
		await flushPromises();
		expect((wrapper.find('.search-input').element as HTMLInputElement).value).toBe('hello');

		await wrapper.find('.sort-select').setValue('views');
		await flushPromises();
		expect((wrapper.find('.sort-select').element as HTMLSelectElement).value).toBe('views');

		// resetFilters clears all controls in one cycle
		await wrapper.find('.btn-reset').trigger('click');
		await flushPromises();
		expect((wrapper.find('.search-input').element as HTMLInputElement).value).toBe('');
		expect((wrapper.find('.sort-select').element as HTMLSelectElement).value).toBe('');
		expect(wrapper.find('.sort-dir-btn').text()).toBe('↑');
	});

	it('shows an item error state and retries successfully', async () => {
		const ContentCollection = await importContentCollection();
		itemsFail = true;
		const wrapper = mount(ContentCollection);
		await activateCollection('posts');

		expect(wrapper.find('.error').exists()).toBe(true);
		expect(wrapper.find('.error p').text()).toBe('Failed to fetch items (500)');

		itemsFail = false;
		await wrapper.find('.error button').trigger('click');
		await flushPromises();
		expect(wrapper.find('.items-table').exists()).toBe(true);
	});

	it('shows pagination with prev/next guards when items span multiple pages', async () => {
		const ContentCollection = await importContentCollection();
		// 25 total items at the default page size of 20 → 2 pages
		currentItems = { data: [{ id: '1', title: 'First', views: 1 }], total_count: 25 };
		const wrapper = mount(ContentCollection);
		await activateCollection('posts');

		const pagination = wrapper.find('.pagination');
		expect(pagination.exists()).toBe(true);
		expect(pagination.text()).toContain('Page 1 of 2');
		const buttons = wrapper.findAll('.pagination button');
		expect(buttons[0].attributes('disabled')).toBeDefined(); // prevPage is a no-op on page 1

		// Advance to the last page
		currentItems = { data: [], total_count: 25 };
		await buttons[1].trigger('click');
		await flushPromises();
		expect(wrapper.find('.pagination').text()).toContain('Page 2 of 2');

		// prevPage moves back; nextPage is a no-op on the last page
		await buttons[0].trigger('click');
		await flushPromises();
		expect(wrapper.find('.pagination').text()).toContain('Page 1 of 2');
	});

	it('shows an empty row when the active collection has no items', async () => {
		const ContentCollection = await importContentCollection();
		currentItems = { data: [], total_count: 0 };
		const wrapper = mount(ContentCollection);
		await activateCollection('posts');

		expect(wrapper.find('.empty-row').exists()).toBe(true);
		expect(wrapper.find('.empty-row').text()).toBe('No items in this collection yet.');
	});
});
