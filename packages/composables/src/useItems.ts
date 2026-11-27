import { useServer } from './useServer.js';
import { onMounted, ref } from 'vue';

/**
 * Composable that fetches items from a collection via the server API.
 * Handles loading states, errors, and auto-refresh on server info changes.
 *
 * @param collection - The collection name to fetch items from
 * @param options - Optional configuration (limit, page, filters, sort, fields)
 *
 * @example
 * import { useItems } from '@directus/composables';
 *
 * const { data, loading, error, refresh } = useItems('posts', {
 *   limit: 10,
 *   page: 1,
 *   fields: ['id', 'title'],
 *   sort: '-date_published'
 * });
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8055';

export function useItems(
	collection: string,
	options: {
		limit?: number;
		page?: number;
		filters?: Record<string, unknown>;
		sort?: string;
		fields?: string[];
	} = {},
) {
	const server = useServer();

	const data = ref<Array<Record<string, unknown>>>([]);
	const loading = ref(false);
	const error = ref<Error | null>(null);
	const total = ref(0);
	const page = ref(options.page ?? 1);
	const limit = ref(options.limit ?? 20);
	const sort = ref(options.sort ?? '');
	const fields = ref<string[]>(options.fields ?? []);
	const filters = ref(options.filters ?? {});

	async function fetchItems() {
		if (!server.info.value) {
			error.value = new Error('Server info not available');
			return;
		}

		loading.value = true;
		error.value = null;

		try {
			// Build query parameters
			const params = new URLSearchParams();
			if (limit.value) params.append('limit', limit.value.toString());
			if (page.value) params.append('page', page.value.toString());
			if (sort.value) params.append('sort', sort.value);

			// Field selection
			if (fields.value.length > 0) {
				params.append('fields', fields.value.join(','));
			}

			// Filters: apply as direct query params (API supports both raw and filter[] forms)
			for (const [key, value] of Object.entries(filters.value)) {
				if (value !== undefined && value !== null && value !== '') {
					params.append(key, String(value));
				}
			}

			const serverInfo = server.info.value;
			const baseUrl = serverInfo.projectLogoUrl || BASE_URL;
			const response = await fetch(`${baseUrl}/items/${collection}?${params.toString()}`);

			if (!response.ok) {
				throw new Error(`Failed to fetch items: ${response.status}`);
			}

			const result = await response.json();
			data.value = result.data ?? [];
			total.value = result.meta?.totalCount ?? 0;
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			data.value = [];
		} finally {
			loading.value = false;
		}
	}

	/**
	 * Refetch items with current parameters.
	 */
	async function refresh() {
		await fetchItems();
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

	/**
	 * Create a new item in the collection.
	 *
	 * @param item - The item data to create
	 * @returns The created item, or null on error
	 */
	async function createItem(item: Record<string, unknown>) {
		if (!server.info.value) {
			error.value = new Error('Server info not available');
			return null;
		}

		try {
			const serverInfo = server.info.value;
			const baseUrl = serverInfo.projectLogoUrl || BASE_URL;
			const response = await fetch(`${baseUrl}/items/${collection}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(item),
			});

			if (!response.ok) {
				throw new Error(`Failed to create item: ${response.status}`);
			}

			const result = await response.json();
			return result.data ?? result;
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			return null;
		}
	}

	/**
	 * Update an existing item by id.
	 *
	 * @param itemId - The id of the item to update
	 * @param updates - Fields to update
	 * @returns The updated item, or null on error
	 */
	async function updateItem(itemId: string, updates: Record<string, unknown>) {
		if (!server.info.value) {
			error.value = new Error('Server info not available');
			return null;
		}

		try {
			const serverInfo = server.info.value;
			const baseUrl = serverInfo.projectLogoUrl || BASE_URL;
			const response = await fetch(`${baseUrl}/items/${collection}/${itemId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(updates),
			});

			if (!response.ok) {
				throw new Error(`Failed to update item: ${response.status}`);
			}

			const result = await response.json();
			return result.data ?? result;
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			return null;
		}
	}

	/**
	 * Delete an item by id.
	 *
	 * @param itemId - The id of the item to delete
	 * @returns true if deleted, false on error
	 */
	async function deleteItem(itemId: string): Promise<boolean> {
		if (!server.info.value) {
			error.value = new Error('Server info not available');
			return false;
		}

		try {
			const serverInfo = server.info.value;
			const baseUrl = serverInfo.projectLogoUrl || BASE_URL;
			const response = await fetch(`${baseUrl}/items/${collection}/${itemId}`, {
				method: 'DELETE',
			});

			if (!response.ok) {
				throw new Error(`Failed to delete item: ${response.status}`);
			}

			return true;
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			return false;
		}
	}

	onMounted(() => {
		fetchItems();
	});

	return {
		data,
		loading,
		error,
		total,
		page,
		limit,
		sort,
		fields,
		filters,
		refresh,
		setPage,
		setLimit,
		setSort,
		setFilters,
		createItem,
		updateItem,
		deleteItem,
	};
}
