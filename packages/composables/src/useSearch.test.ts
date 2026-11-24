import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { useSearch } from './useSearch';

const {
	resolveApiBaseUrl: mockResolveApiBaseUrl,
	useServerMock,
	serverInfoRef,
} = vi.hoisted(() => {
	const info: { value: unknown } = { value: null };
	return {
		resolveApiBaseUrl: vi.fn(() => 'http://test-api.example.com'),
		useServerMock: vi.fn(),
		serverInfoRef: info,
	};
});

vi.mock('./useServer', () => ({
	resolveApiBaseUrl: mockResolveApiBaseUrl,
	useServer: useServerMock,
}));

globalThis.fetch = vi.fn();

// This app factory is required to exercise the composable's onMounted behavior.
const SearchTestComponent = defineComponent({
	props: {
		query: { type: String, required: true },
	},
	setup(props) {
		const { results } = useSearch(props.query);
		return () =>
			h(
				'div',
				results.value.map((result) => String(result.title)),
			);
	},
});

const createSearchTestApp = (query: string) => createApp(SearchTestComponent, { query });

describe('useSearch', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockResolveApiBaseUrl.mockReturnValue('http://test-api.example.com');
		vi.mocked(globalThis.fetch).mockReset();
		serverInfoRef.value = { version: '11.0.0' };
		useServerMock.mockReturnValue({
			info: serverInfoRef,
			setInfo: vi.fn(),
		});
	});

	it('returns refs with default values', () => {
		const {
			results,
			loading,
			error,
			total,
			page,
			limit,
			sort,
			filters,
			refresh,
			setPage,
			setLimit,
			setSort,
			setFilters,
		} = useSearch('test');

		expect(results.value).toEqual([]);
		expect(loading.value).toBe(false);
		expect(error.value).toBeNull();
		expect(total.value).toBe(0);
		expect(page.value).toBe(1);
		expect(limit.value).toBe(20);
		expect(sort.value).toBe('');
		expect(filters.value).toEqual({});
		expect(refresh).toBeTypeOf('function');
		expect(setPage).toBeTypeOf('function');
		expect(setLimit).toBeTypeOf('function');
		expect(setSort).toBeTypeOf('function');
		expect(setFilters).toBeTypeOf('function');
	});

	it('accepts collections and options parameters', () => {
		const { page, limit, sort, filters } = useSearch('test', ['posts', 'users'], {
			limit: 10,
			page: 2,
			sort: '-createdAt',
			filters: { status: 'published' },
		});

		expect(page.value).toBe(2);
		expect(limit.value).toBe(10);
		expect(sort.value).toBe('-createdAt');
		expect(filters.value).toEqual({ status: 'published' });
	});

	describe('fetchSearch', () => {
		it('does nothing when server info is not available', async () => {
			serverInfoRef.value = null;
			const { refresh: fetchSearch } = useSearch('test');

			await fetchSearch();

			expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
		});

		it('does nothing when query is empty', async () => {
			const { refresh: fetchSearch } = useSearch('');

			await fetchSearch();

			expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
		});

		it('fetches search results from API', async () => {
			const mockResults = [
				{ id: '1', title: 'Post 1', status: 'published' },
				{ id: '2', title: 'Post 2', status: 'published' },
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 42 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const {
				refresh: fetchSearch,
				results,
				loading,
				error,
				total,
				page,
			} = useSearch('directus', ['posts', 'pages'], {
				limit: 10,
				page: 1,
			});

			await fetchSearch();

			expect(loading.value).toBe(false);
			expect(error.value).toBeNull();
			expect(results.value).toEqual(mockResults);
			expect(total.value).toBe(42);
			expect(page.value).toBe(1);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0][0];
			expect(fetchCall).toBe(
				'http://test-api.example.com/search?q=directus&collections%5B%5D=posts&collections%5B%5D=pages&limit=10&page=1',
			);
		});

		it('sets loading true during fetch', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: [], meta: { totalCount: 0 } }), {
					status: 200,
				}),
			);

			const { refresh: fetchSearch, loading } = useSearch('test');
			const fetchPromise = fetchSearch();

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});

		it('sets error and clears results on fetch failure', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 500 }));

			const { refresh: fetchSearch, results, loading, error } = useSearch('test');

			await fetchSearch();

			expect(loading.value).toBe(false);
			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('500');
			expect(results.value).toEqual([]);
		});

		it('sets error when response.json throws', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response('invalid json', { status: 200 }));

			const { refresh: fetchSearch, error, results } = useSearch('test');

			await fetchSearch();

			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('Unexpected token');
			expect(results.value).toEqual([]);
		});

		it('handles empty response data', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: null }), {
					status: 200,
				}),
			);

			const { refresh: fetchSearch, results } = useSearch('test');

			await fetchSearch();

			expect(results.value).toEqual([]);
		});

		it('sets loading false even on error', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 500 }));

			const { refresh: fetchSearch, loading } = useSearch('test');
			const fetchPromise = fetchSearch();

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});
	});

	describe('refresh', () => {
		it('refetches search results with current parameters', async () => {
			const mockResults = [{ id: '1', title: 'Test' }];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 1 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { refresh, results } = useSearch('test');

			await refresh();

			expect(results.value).toEqual(mockResults);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
		});
	});

	describe('setPage', () => {
		it('changes page and refetches', async () => {
			const mockResults = [{ id: '1', title: 'Test' }];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 1 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { setPage, page } = useSearch('test');

			await setPage(3);

			expect(page.value).toBe(3);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
		});
	});

	describe('setLimit', () => {
		it('changes limit, resets page to 1, and refetches', async () => {
			const mockResults = [{ id: '1', title: 'Test' }];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 1 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { setLimit, limit, page } = useSearch('test', [], { limit: 10, page: 2 });

			await setLimit(20);

			expect(limit.value).toBe(20);
			expect(page.value).toBe(1);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
		});
	});

	describe('setSort', () => {
		it('changes sort and refetches', async () => {
			const mockResults = [{ id: '1', title: 'Test' }];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 1 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { setSort, sort } = useSearch('test');

			await setSort('-updatedAt');

			expect(sort.value).toBe('-updatedAt');
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
		});
	});

	describe('setFilters', () => {
		it('updates filters, resets page to 1, and refetches', async () => {
			const mockResults = [{ id: '1', title: 'Test' }];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 1 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { setFilters, filters, page } = useSearch('test', [], { filters: {} });

			await setFilters({ status: 'published' });

			expect(filters.value).toEqual({ status: 'published' });
			expect(page.value).toBe(1);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
		});
	});

	describe('onMounted', () => {
		it('fetches on mount when query is provided', async () => {
			const mockResults = [{ id: '1', title: 'Test' }];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockResults, meta: { totalCount: 1 } }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const app = createSearchTestApp('test');

			const el = document.createElement('div');
			app.mount(el);
			await nextTick();

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			// Wait for the async fetch to resolve and update results
			await new Promise((resolve) => setTimeout(resolve, 100));

			expect(el.textContent).toContain('Test');

			app.unmount();
		});

		it('does not fetch on mount when query is empty', async () => {
			const app = createSearchTestApp('');

			const el = document.createElement('div');
			app.mount(el);
			await nextTick();

			expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();

			app.unmount();
		});
	});
});
