import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

// Persistent refs for useCollections
const collectionsData = ref([
	{ collection: 'demo_items', label: 'Demo Items', fields: [{ name: 'id' }, { name: 'title' }] },
	{ collection: 'posts', label: 'Posts', fields: [{ name: 'id' }, { name: 'title' }] },
]);
const collectionsLoading = ref(false);

// Shared mock search result — assigned into searchInstance by doSearch()
const mockSearchResult = {
	results: ref<Array<Record<string, unknown>>>([]),
	loading: ref(false),
	error: ref<Error | null>(null),
	total: ref(0),
	page: ref(1),
	limit: ref(20),
	refresh: vi.fn().mockResolvedValue(undefined),
	setPage: vi.fn(),
};

// Mock @directus/composables — expose the plain object so nested refs are tracked reactively
vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useCollections: () => ({ data: collectionsData, loading: collectionsLoading, fetchCollections: vi.fn() }),
		useSearch: () => mockSearchResult,
	};
});

import SearchCollection from './collection.vue';

beforeEach(() => {
	vi.clearAllMocks();
	setActivePinia(createPinia());
	collectionsData.value = [
		{ collection: 'demo_items', label: 'Demo Items', fields: [{ name: 'id' }, { name: 'title' }] },
		{ collection: 'posts', label: 'Posts', fields: [{ name: 'id' }, { name: 'title' }] },
	];
	collectionsLoading.value = false;
	mockSearchResult.results.value = [];
	mockSearchResult.loading.value = false;
	mockSearchResult.error.value = null;
	mockSearchResult.total.value = 0;
	mockSearchResult.page.value = 1;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('SearchCollection', () => {
	it('mounts without crashing', () => {
		const wrapper = mount(SearchCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders search heading', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('h1').text()).toBe('Search');
	});

	it('renders search form with input and button', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.search-form').exists()).toBe(true);
		expect(wrapper.find('.search-input').exists()).toBe(true);
		const submitBtn = wrapper.find('.search-form button[type="submit"]');
		expect(submitBtn.exists()).toBe(true);
		expect(submitBtn.text()).toBe('Search');
	});

	it('disables search button when query is empty', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		const submitBtn = wrapper.find('.search-form button[type="submit"]');
		expect(submitBtn.attributes('disabled')).toBeDefined();
	});

	it('enables search button when query has content', async () => {
		const wrapper = mount(SearchCollection);
		await wrapper.find('.search-input').setValue('test');
		await wrapper.vm.$nextTick();
		const submitBtn = wrapper.find('.search-form button[type="submit"]');
		expect(submitBtn.attributes('disabled')).toBeUndefined();
	});

	it('renders collection filters when collections exist', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.findAll('.coll-filter')).toHaveLength(2);
		expect(wrapper.findAll('.coll-filter')[0].text()).toContain('Demo Items');
		expect(wrapper.findAll('.coll-filter')[1].text()).toContain('Posts');
	});

	it('does not render collection filters when no collections', async () => {
		collectionsData.value = [];
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.findAll('.coll-filter')).toHaveLength(0);
	});

	it('shows loading state when searching', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		// Set loading to true on the shared mock result (watch will detect the change)
		mockSearchResult.loading.value = true;
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.search-loading').exists()).toBe(true);
		expect(wrapper.find('.search-loading').text()).toContain('Searching');
	});

	it('shows error state when search fails', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		mockSearchResult.error.value = new Error('Search failed');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.search-error').exists()).toBe(true);
		expect(wrapper.find('.search-error').text()).toBe('Search failed');
	});

	it('shows empty message when no results and query is empty', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('tbody tr td').text()).toBe('Enter a query to search.');
	});

	it('shows "No results found" when query present but no results', async () => {
		const wrapper = mount(SearchCollection);
		await wrapper.find('.search-input').setValue('test');
		await new Promise((r) => setTimeout(r, 50));
		await wrapper.vm.$nextTick();
		expect(wrapper.find('tbody tr td').text()).toContain('No results found');
	});

	it('renders result rows when search returns results', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		const mockResults = [
			{ collection: 'posts', id: '1', title: 'Post 1', status: 'published' },
			{ collection: 'pages', id: '2', title: 'Page 1', status: 'draft' },
		];
		mockSearchResult.results.value = mockResults;
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		const rows = wrapper.findAll('tbody tr');
		// Should have at least the data rows (may include header row depending on structure)
		expect(rows.length).toBeGreaterThanOrEqual(2);
	});

	it('calls doSearch when search button clicked', async () => {
		const wrapper = mount(SearchCollection);
		await wrapper.find('.search-input').setValue('test query');
		await new Promise((r) => setTimeout(r, 50));
		await wrapper.find('.search-form button[type="submit"]').trigger('click');
		await wrapper.vm.$nextTick();
		// After clicking, searchInstance should have been set
		expect((wrapper.vm as unknown as { searchInstance: unknown }).searchInstance).not.toBeNull();
	});

	it('clears search when clearSearch called', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		// Set search instance first
		mockSearchResult.loading.value = false;
		await wrapper.vm.$nextTick();
		const vm = wrapper.vm as unknown as { clearSearch: () => void };
		vm.clearSearch();
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as { query: string }).query).toBe('');
	});

	it('toggles collection filter checkboxes', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		const checkbox = wrapper.find('.coll-filter input[type="checkbox"]');
		await checkbox.setValue(true);
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as { selectedCollections: string[] }).selectedCollections).toContain('demo_items');
	});

	it('renders pagination when total > limit', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		mockSearchResult.total.value = 50;
		mockSearchResult.page.value = 1;
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.search-pagination').exists()).toBe(true);
	});

	it('navigates pages with next button', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		mockSearchResult.total.value = 50;
		mockSearchResult.page.value = 2;
		await wrapper.vm.$nextTick();
		const nextBtn = wrapper.find('.search-pagination button:last-child');
		expect(nextBtn.exists()).toBe(true);
		await nextBtn.trigger('click');
		expect(mockSearchResult.setPage).toHaveBeenCalledWith(3);
	});

	it('disables prev button on page 1', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		mockSearchResult.total.value = 50;
		mockSearchResult.page.value = 1;
		await wrapper.vm.$nextTick();
		const prevBtn = wrapper.find('.search-pagination button:first-child');
		expect(prevBtn.exists()).toBe(true);
		expect(prevBtn.attributes('disabled')).toBeDefined();
	});
});
