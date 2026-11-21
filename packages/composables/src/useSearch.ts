import { useServer, resolveApiBaseUrl } from './useServer.js';
import { onMounted, ref } from 'vue';

/**
 * Composable that performs search across collections via the server API.
 * Handles loading states, errors, and auto-refresh on server info changes.
 *
 * @param query - The search query string
 * @param collections - Optional array of collection names to search in (defaults to all)
 * @param options - Optional configuration (limit, page, filters, sort)
 *
 * @example
 * import { useSearch } from '@directus/composables';
 *
 * const { results, loading, error, refresh } = useSearch('directus', {
 *   collections: ['posts', 'pages'],
 *   limit: 10,
 *   page: 1,
 * });
 */
export function useSearch(
	query: string,
	collections: string[] = [],
	options: {
		limit?: number;
		page?: number;
		filters?: Record<string, unknown>;
		sort?: string;
	} = {},
) {
	const server = useServer();

	const results = ref<Array<Record<string, unknown>>>([]);
	const loading = ref(false);
	const error = ref<Error | null>(null);
	const total = ref(0);
	const page = ref(options.page ?? 1);
	const limit = ref(options.limit ?? 20);
	const sort = ref(options.sort ?? '');
	const filters = ref(options.filters ?? {});

	async function fetchSearch() {
		if (!server.info?.value) {
			error.value = new Error('Server info not available');
			return;
		}

		if (!query.trim()) {
			results.value = [];
			return;
		}

		loading.value = true;
		error.value = null;

		try {
			// Build query parameters
			const params = new URLSearchParams();
			params.append('q', query);
			if (collections.length) {
				collections.forEach((col) => params.append('collections[]', col));
			}
			if (limit.value) params.append('limit', limit.value.toString());
			if (page.value) params.append('page', page.value.toString());
			if (sort.value) params.append('sort', sort.value);
			Object.entries(filters.value).forEach(([key, value]) => {
				params.append(`filter[${key}]`, String(value));
			});

			const response = await fetch(
				`${resolveApiBaseUrl()}/search?${params.toString()}`,
			);

			if (!response.ok) {
				throw new Error(`Failed to search: ${response.status}`);
			}

			const result = await response.json();
			results.value = result.data ?? [];
			total.value = result.meta?.totalCount ?? 0;
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			results.value = [];
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Refetch search results with current parameters.
	 */
	async function refresh() {
		await fetchSearch();
	}

	/**
	 * Change page and refetch.
	 */
	function setPage(newPage: number) {
		page.value = newPage;
		return refresh();
	}

	/**
	 * Change limit and refetch.
	 */
	function setLimit(newLimit: number) {
		limit.value = newLimit;
		page.value = 1;
		return refresh();
	}

	/**
	 * Change sort and refetch.
	 */
	function setSort(newSort: string) {
		sort.value = newSort;
		return refresh();
	}

	/**
	 * Update filters and refetch.
	 */
	function setFilters(newFilters: Record<string, unknown>) {
		filters.value = newFilters;
		page.value = 1;
		return refresh();
	}

	onMounted(() => {
		if (query.trim()) {
			fetchSearch();
		}
	});

	return {
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
	};
}
