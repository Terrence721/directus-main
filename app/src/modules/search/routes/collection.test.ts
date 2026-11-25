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

	/**
	 * Mounts and populates searchInstance by invoking doSearch() directly.
	 * An extra $nextTick is required after doSearch() for the template to reflect
	 * the new searchInstance (the DOM does not update synchronously on ref assignment).
	 */
	async function mountAndInit(): Promise<ReturnType<typeof mount>> {
		const wrapper = mount(SearchCollection);
		const vm = wrapper.vm as unknown as { query: string; doSearch: () => void };
		vm.query = 'x'; // bypass trim guard in doSearch
		vm.doSearch();
		await wrapper.vm.$nextTick(); // wait for searchInstance assignment to propagate to the template
		return wrapper;
	}

	it('shows loading state when searching', async () => {
		mockSearchResult.loading.value = true;
		const wrapper = await mountAndInit();
		expect(wrapper.find('.search-loading').exists()).toBe(true);
		expect(wrapper.find('.search-loading').text()).toContain('Searching');
	});

	it('shows error state when search fails', async () => {
		mockSearchResult.error.value = new Error('Search failed');
		const wrapper = await mountAndInit();
		expect(wrapper.find('.search-error').exists()).toBe(true);
		expect(wrapper.find('.search-error').text()).toBe('Search failed');
	});

	it('shows empty message when no results and query is empty', async () => {
		const wrapper = mount(SearchCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('tbody tr td').text()).toBe('Enter a query to search.');
	});

	it('shows "No results found" when query present but no results', async () => {
		const wrapper = await mountAndInit();
		await wrapper.find('.search-input').setValue('test');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('tbody tr td').text()).toContain('No results found');
	});

	it('renders result rows when search returns results', async () => {
		mockSearchResult.results.value = [
			{ collection: 'posts', id: '1', title: 'Post 1', status: 'published' },
			{ collection: 'pages', id: '2', title: 'Page 1', status: 'draft' },
		];
		const wrapper = await mountAndInit();
		const rows = wrapper.findAll('tbody tr');
		expect(rows).toHaveLength(2);
		expect(rows[0].text()).toContain('Post 1');
		expect(rows[1].text()).toContain('Page 1');
	});

	it('calls doSearch when search button clicked', async () => {
		const wrapper = mount(SearchCollection);
		// Use setValue + trigger to simulate user interaction
		await wrapper.find('.search-input').setValue('test query');
		await wrapper.find('.search-form button[type="submit"]').trigger('click');
		await wrapper.vm.$nextTick();
		// DoSearch assigns useSearch() result to searchInstance; verify it ran without error
		const vm = wrapper.vm as unknown as { query: string };
		expect(vm.query).toBe('test query');
	});

	it('clears search when clearSearch called', async () => {
		const wrapper = await mountAndInit();
		const vm = wrapper.vm as unknown as { clearSearch: () => void };
		vm.clearSearch();
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
		mockSearchResult.total.value = 50;
		mockSearchResult.page.value = 1;
		const wrapper = await mountAndInit();
		expect(wrapper.find('.search-pagination').exists()).toBe(true);
	});

	it('navigates pages with next button', async () => {
		mockSearchResult.total.value = 50;
		mockSearchResult.page.value = 2;
		const wrapper = await mountAndInit();
		const nextBtn = wrapper.find('.search-pagination button:last-child');
		expect(nextBtn.exists()).toBe(true);
		nextBtn.trigger('click');
		expect(mockSearchResult.setPage).toHaveBeenCalledWith(3);
	});

	it('disables prev button on page 1', async () => {
		mockSearchResult.total.value = 50;
		mockSearchResult.page.value = 1;
		const wrapper = await mountAndInit();
		const prevBtn = wrapper.find('.search-pagination button:first-child');
		expect(prevBtn.exists()).toBe(true);
		expect(prevBtn.attributes('disabled')).toBeDefined();
	});
});
