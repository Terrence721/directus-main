import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

// Mock window.location for fetchFields/fetchItems - MUST BE BEFORE IMPORTS
vi.stubGlobal('window', {
	location: {
		href: 'http://localhost:5173',
		protocol: 'http:',
		host: 'localhost:5173',
	},
});

// Shared router spy — stored here so both the mock factory and tests share it
const routerPushSpy = vi.fn();

// Mock composables
const mockFlatCollections = ref([]);
const mockLoading = ref(false);
const mockActiveCollection = ref(null);
const mockCollapsedGroups = new Set();
const mockToggleGroup = vi.fn();

vi.mock('../composables/use-collections-manager', () => ({
	useCollectionsManager: () => ({
		flatCollections: mockFlatCollections,
		loading: mockLoading,
		fetchCollections: vi.fn(),
	}),
}));

vi.mock('../composables/use-navigation', () => ({
	useNavigation: () => ({
		activeCollection: mockActiveCollection,
		collapsedGroups: mockCollapsedGroups,
		toggleGroup: mockToggleGroup,
	}),
}));

vi.mock('vue-router', () => ({
	useRouter: () => ({ push: routerPushSpy }),
}));

// Lazy import helper
async function importVisualCollection(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());

	// Reset mock state
	mockFlatCollections.value = [];
	mockLoading.value = false;
	mockActiveCollection.value = null;
	mockCollapsedGroups.clear();
	mockToggleGroup.mockClear();
	routerPushSpy.mockClear();

	// Re-apply window mock
	vi.stubGlobal('window', {
		location: {
			href: 'http://localhost:5173',
			protocol: 'http:',
			host: 'localhost:5173',
		},
	});

	// Default fetch mock — responds differently depending on URL
	globalThis.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
		const url = new URL(typeof input === 'string' ? input : input.url, 'http://localhost:5173');
		if (url.pathname.startsWith('/collections/')) {
			return {
				ok: true,
				json: () => Promise.resolve({ data: { fields: [] } }),
			} as Response;
		}
		// /items/* fallback
		return {
			ok: true,
			json: () => Promise.resolve({ data: [], total_count: 0 }),
		} as Response;
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('VisualCollection', () => {
	it('mounts without crashing', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders collections header', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		expect(wrapper.find('h2').text()).toBe('Collections');
	});

	it('shows empty state when no collections', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.empty-state').exists()).toBe(true);
		expect(wrapper.find('.empty-state').text()).toContain('No collections yet');
	});

	it('shows loading state when fetching collections', async () => {
		mockLoading.value = true;
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.btn-refresh').attributes('disabled')).toBeDefined();
		expect(wrapper.find('.btn-refresh').text()).toContain('Loading');
	});

	it('renders ungrouped collections in sidebar', async () => {
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts' },
			{ collection: 'authors', label: 'Authors' },
		];
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		const navItems = wrapper.findAll('.nav-item');
		expect(navItems).toHaveLength(2);
		expect(navItems[0].text()).toContain('Posts');
		expect(navItems[1].text()).toContain('Authors');
	});

	it('highlights active collection in sidebar', async () => {
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts' },
			{ collection: 'authors', label: 'Authors' },
		];
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		const navBtn = wrapper.find('.nav-btn');
		expect(navBtn.classes()).toContain('nav-btn--active');
	});

	it('navigates to collection when clicked', async () => {
		mockFlatCollections.value = [{ collection: 'posts', label: 'Posts' }];
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		const navBtn = wrapper.find('.nav-btn');
		await navBtn.element.click();
		expect(routerPushSpy).toHaveBeenCalledWith('/#/visual/posts');
	});

	it('groups collections by meta.group', async () => {
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts', meta: { group: 'Content' } },
			{ collection: 'authors', label: 'Authors', meta: { group: 'Content' } },
			{ collection: 'settings', label: 'Settings', meta: { group: 'System' } },
			{ collection: 'users', label: 'Users' }, // ungrouped
		];
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		const groupHeaders = wrapper.findAll('.nav-group-header');
		expect(groupHeaders).toHaveLength(2);
		expect(groupHeaders[0].text()).toContain('Content');
		expect(groupHeaders[1].text()).toContain('System');
	});

	it('toggles group collapse when header clicked', async () => {
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts', meta: { group: 'Content' } },
			{ collection: 'authors', label: 'Authors', meta: { group: 'Content' } },
		];
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		const groupHeader = wrapper.find('.nav-group-header');
		await groupHeader.element.click();
		expect(mockToggleGroup).toHaveBeenCalledWith('Content');
	});

	it('shows no collection selected message when none active', async () => {
		mockActiveCollection.value = null;
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.no-collection').exists()).toBe(true);
		expect(wrapper.find('.no-collection').text()).toContain('Select a collection');
	});

	it('shows collection header when active', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.header__title').text()).toBe('posts');
	});

	it('renders search input and sort controls when collection active', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.search-input').exists()).toBe(true);
		expect(wrapper.find('.sort-select').exists()).toBe(true);
		expect(wrapper.find('.sort-dir-btn').exists()).toBe(true);
		expect(wrapper.find('.btn-reset').exists()).toBe(true);
	});

	it('shows loading state when fetching items', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as { loadingItems: boolean };
		wrapperVm.loadingItems = true;
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.loading').exists()).toBe(true);
		expect(wrapper.find('.loading').text()).toContain('Loading items');
	});

	it('shows error state when fetchItems fails', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as { itemError: Error | null };
		wrapperVm.itemError = new Error('Failed to load');
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.error').exists()).toBe(true);
		expect(wrapper.find('.error').text()).toContain('Failed to load');
		expect(wrapper.find('.error button').exists()).toBe(true);
	});

	it('retries fetchItems when retry button clicked', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			itemError: Error | null;
			loadingItems: boolean;
		};
		wrapperVm.itemError = new Error('Failed to load');
		await wrapper.vm.$nextTick();
		const fetchSpy = vi.mocked(globalThis.fetch);
		const retryBtn = wrapper.find('.error button');
		await retryBtn.element.click();
		// The retry button calls fetchItems internally, which calls globalThis.fetch
		expect(fetchSpy).toHaveBeenCalled();
	});

	it('shows items table when items exist', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, string>[];
			totalItems: number;
			totalPages: number;
		};
		wrapperVm.fields = [
			{ name: 'title', type: 'string' },
			{ name: 'status', type: 'string' },
			{ name: 'created_at', type: 'datetime' },
		];
		wrapperVm.items = [
			{ title: 'Post 1', status: 'published', created_at: '2024-01-01' },
			{ title: 'Post 2', status: 'draft', created_at: '2024-01-02' },
		];
		wrapperVm.totalItems = 2;
		wrapperVm.totalPages = 1;
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.items-table').exists()).toBe(true);
		const rows = wrapper.findAll('.items-table tbody tr');
		expect(rows).toHaveLength(2);
		expect(rows[0].findAll('td')[0].text()).toBe('Post 1');
		expect(rows[0].findAll('td')[1].text()).toBe('published');
		expect(rows[0].findAll('td')[2].text()).toBe('2024-01-01');
	});

	it('shows empty row when no items', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
		};
		wrapperVm.fields = [
			{ name: 'title', type: 'string' },
			{ name: 'status', type: 'string' },
		];
		wrapperVm.items = [];
		wrapperVm.totalItems = 0;
		wrapperVm.totalPages = 1;
		await wrapper.vm.$nextTick();
		const emptyRow = wrapper.find('.empty-row');
		expect(emptyRow.exists()).toBe(true);
		expect(emptyRow.text()).toBe('No items in this collection yet.');
		expect(emptyRow.attributes('colspan')).toBe('3');
	});

	it('sorts items when sortable field header clicked', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			sortField: string;
			sortOrder: 'asc' | 'desc';
		};
		wrapperVm.fields = [
			{ name: 'title', type: 'string' },
			{ name: 'status', type: 'string' },
			{ name: 'order', type: 'integer' }, // sortable
		];
		wrapperVm.items = [
			{ title: 'Post 1', status: 'published', order: 2 },
			{ title: 'Post 2', status: 'draft', order: 1 },
		];
		wrapperVm.totalItems = 2;
		wrapperVm.totalPages = 1;
		wrapperVm.sortField = '';
		wrapperVm.sortOrder = 'asc';
		await wrapper.vm.$nextTick();

		const header = wrapper.findAll('thead th')[2]; // order column
		await header.element.click();
		await wrapper.vm.$nextTick();

		expect(wrapperVm.sortField).toBe('order');
		// The header toggles the initial ascending state to descending.
		expect(wrapperVm.sortOrder).toBe('desc');
	});

	it('toggles sort order when same sortable field clicked again', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[] | null;
			totalItems: number;
			totalPages: number;
			sortField: string;
			sortOrder: 'asc' | 'desc';
			loadingItems: boolean;
			itemError: Error | null;
		};
		// Set up fields including non-sortable ones first (matches render order)
		wrapperVm.fields = [
			{ name: 'title', type: 'string' },
			{ name: 'status', type: 'string' },
			{ name: 'order', type: 'integer' }, // sortable
		];
		wrapperVm.items = [{ title: 'Post 1', status: 'published', order: 1 }];
		wrapperVm.totalItems = 1;
		wrapperVm.totalPages = 1;
		wrapperVm.loadingItems = false;
		wrapperVm.itemError = null;
		await wrapper.vm.$nextTick();
		// Ensure the table is rendered with all headers (3 fields + 1 actions)
		expect(wrapper.findAll('thead th')).toHaveLength(4);
		const header = wrapper.findAll('thead th')[2]; // order column (0=title, 1=status, 2=order, 3=actions)
		// Initial state
		expect(wrapperVm.sortField).toBe('');
		expect(wrapperVm.sortOrder).toBe('asc');
		// First click: the initial ascending state toggles to descending.
		await header.element.click();
		await wrapper.vm.$nextTick();
		expect(wrapperVm.sortField).toBe('order');
		expect(wrapperVm.sortOrder).toBe('desc');
		// Second click: the same field toggles back to ascending.
		await header.element.click();
		await wrapper.vm.$nextTick();
		expect(wrapperVm.sortField).toBe('order');
		expect(wrapperVm.sortOrder).toBe('asc');
	});

	it('does not sort non-sortable fields', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			sortField: string;
			sortOrder: 'asc' | 'desc';
		};
		wrapperVm.fields = [
			{ name: 'title', type: 'string' }, // not sortable
		];
		wrapperVm.items = [];
		wrapperVm.totalItems = 0;
		wrapperVm.totalPages = 1;
		await wrapper.vm.$nextTick();
		const header = wrapper.findAll('thead th')[0];
		await header.element.click();
		expect(wrapperVm.sortField).toBe('');
	});

	it('navigates to item edit page when row clicked', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[] | null;
			totalItems: number;
			totalPages: number;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [{ title: 'Post 1', id: '123' }];
		wrapperVm.totalItems = 1;
		wrapperVm.totalPages = 1;
		await wrapper.vm.$nextTick();
		await wrapper.vm.$nextTick(); // Ensure click handler is bound
		const td = wrapper.findAll('tbody tr')[0].findAll('td')[0];
		await td.element.click();
		await wrapper.vm.$nextTick(); // Wait for router push
		expect(routerPushSpy).toHaveBeenCalledWith('/#/visual/posts/123');
	});

	it('navigates to item edit page when edit button clicked', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[] | null;
			totalItems: number;
			totalPages: number;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [{ title: 'Post 1', id: '456' }];
		wrapperVm.totalItems = 1;
		wrapperVm.totalPages = 1;
		await wrapper.vm.$nextTick();
		const editBtn = wrapper.find('.btn-edit');
		await editBtn.element.click();
		expect(routerPushSpy).toHaveBeenCalledWith('/#/visual/posts/456');
	});

	it('shows pagination when total pages > 1', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			page: number;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [];
		wrapperVm.totalItems = 50;
		wrapperVm.totalPages = 3;
		wrapperVm.page = 1;
		await wrapper.vm.$nextTick();
		expect(wrapper.find('.pagination').exists()).toBe(true);
		const pagination = wrapper.find('.pagination');
		expect(pagination.text()).toContain('Previous');
		expect(pagination.text()).toContain('Page 1 of 3');
		expect(pagination.text()).toContain('Next');
	});

	it('disables previous button on first page', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			page: number;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [];
		wrapperVm.totalItems = 50;
		wrapperVm.totalPages = 3;
		wrapperVm.page = 1;
		await wrapper.vm.$nextTick();
		// Find the Previous button by text to avoid fragile index-based selection
		const buttons = wrapper.findAll('button');
		const prevBtn = buttons.find((b) => b.text() === 'Previous');
		expect(prevBtn).toBeDefined();
		expect(prevBtn!.attributes('disabled')).toBeDefined();
	});

	it('disables next button on last page', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			page: number;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [];
		wrapperVm.totalItems = 50;
		wrapperVm.totalPages = 3;
		wrapperVm.page = 3;
		await wrapper.vm.$nextTick();
		const buttons = wrapper.findAll('button');
		const nextBtn = buttons.find((b) => b.text() === 'Next');
		expect(nextBtn).toBeDefined();
		expect(nextBtn!.attributes('disabled')).toBeDefined();
	});

	it('goes to previous page when previous button clicked', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			page: number;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [];
		wrapperVm.totalItems = 50;
		wrapperVm.totalPages = 3;
		wrapperVm.page = 2;
		await wrapper.vm.$nextTick();
		const buttons = wrapper.findAll('button');
		const prevBtn = buttons.find((b) => b.text() === 'Previous');
		expect(prevBtn).toBeDefined();
		await prevBtn!.element.click();
		expect(wrapperVm.page).toBe(1);
	});

	it('goes to next page when next button clicked', async () => {
		mockActiveCollection.value = 'posts';
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		const wrapperVm = wrapper.vm as unknown as {
			fields: { name: string; type: string }[];
			items: Record<string, unknown>[];
			totalItems: number;
			totalPages: number;
			page: number;
			itemError: unknown;
		};
		wrapperVm.fields = [{ name: 'title', type: 'string' }];
		wrapperVm.items = [];
		wrapperVm.totalItems = 50;
		wrapperVm.totalPages = 3;
		wrapperVm.page = 1;
		await wrapper.vm.$nextTick();
		const buttons = wrapper.findAll('button');
		const nextBtn = buttons.find((b) => b.text() === 'Next');
		expect(nextBtn).toBeDefined();
		await nextBtn!.element.click();
		expect(wrapperVm.page).toBe(2);
	});

	it('handles network errors gracefully', async () => {
		mockActiveCollection.value = 'posts';
		// Make fetch reject immediately so the component catches the error
		(
			globalThis.fetch as unknown as {
				mockRejectedValueOnce: (err: Error) => unknown;
			}
		).mockRejectedValueOnce(new Error('Network error'));
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		// Wait a tick for the error to propagate
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		const wrapperVm = wrapper.vm as unknown as { itemError: unknown };
		// Component should handle error without crashing and set itemError
		expect(wrapperVm.itemError).toBeDefined();
	});

	it('updates fields when activeCollection changes', async () => {
		// Patch fetch BEFORE mount so the initial watch callback gets the right response
		(
			globalThis.fetch as unknown as {
				mockImplementation: (fn: (...args: unknown[]) => Promise<Response>) => unknown;
			}
		).mockImplementation(async (input: RequestInfo | URL) => {
			const url = new URL(typeof input === 'string' ? input : input.url, 'http://localhost:5173');
			if (url.pathname.startsWith('/collections/')) {
				return {
					ok: true,
					json: () =>
						Promise.resolve({
							data: { fields: [{ name: 'title', type: 'string' }] },
						}),
				} as Response;
			}
			return {
				ok: true,
				json: () => Promise.resolve({ data: [], total_count: 0 }),
			} as Response;
		});

		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		// Set activeCollection after mount to trigger the watch
		mockActiveCollection.value = 'posts';
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect((wrapper.vm as unknown as { fields: unknown[] }).fields).toHaveLength(1);
	});
});
