import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';

const { useServerStore: mockUseServerStore } = vi.hoisted(() => ({
	useServerStore: vi.fn(),
}));

vi.mock('@directus/stores', () => ({
	useServerStore: mockUseServerStore,
}));

import { useItems } from './useItems.js';

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}

describe('useItems', () => {
	const mockServerInfo = {
		projectLogoUrl: 'http://test-api.example.com',
	};

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockUseServerStore.mockReturnValue({
			info: ref(mockServerInfo),
			setInfo: vi.fn(),
		});
	});

	it('returns refs with default values', () => {
		const result = useItems('posts');
		expect(result.data.value).toEqual([]);
		expect(result.loading.value).toBe(false);
		expect(result.error.value).toBeNull();
		expect(result.total.value).toBe(0);
		expect(result.page.value).toBe(1);
		expect(result.limit.value).toBe(20);
		expect(result.sort.value).toBe('');
		expect(result.fields.value).toEqual([]);
		expect(result.filters.value).toEqual({});
	});

	it('accepts options and applies them as defaults', () => {
		const result = useItems('posts', {
			limit: 10,
			page: 2,
			sort: '-created_at',
			fields: ['id', 'title'],
			filters: { status: 'published' },
		});
		expect(result.limit.value).toBe(10);
		expect(result.page.value).toBe(2);
		expect(result.sort.value).toBe('-created_at');
		expect(result.fields.value).toEqual(['id', 'title']);
		expect(result.filters.value).toEqual({ status: 'published' });
	});

	describe('fetchItems', () => {
		it('populates data and total on successful response', async () => {
			const fetchSpy = vi
				.spyOn(globalThis, 'fetch')
				.mockResolvedValue(jsonResponse({ data: [{ id: '1', title: 'Hello' }], meta: { totalCount: 5 } }));
			const result = useItems('posts');
			await result.refresh();
			expect(result.data.value).toEqual([{ id: '1', title: 'Hello' }]);
			expect(result.total.value).toBe(5);
			expect(fetchSpy).toHaveBeenCalledOnce();
			vi.restoreAllMocks();
		});

		it('sets error on fetch rejection', async () => {
			vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));
			const result = useItems('posts');
			await result.refresh();
			expect(result.error.value).toBeInstanceOf(Error);
			expect(result.data.value).toEqual([]);
			vi.restoreAllMocks();
		});

		it('handles non-OK response as error', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }));
			const result = useItems('posts');
			await result.refresh();
			expect(result.error.value).toBeInstanceOf(Error);
			expect(result.error.value?.message).toContain('404');
			vi.restoreAllMocks();
		});

		it('uses projectLogoUrl when available', async () => {
			const fetchSpy = vi
				.spyOn(globalThis, 'fetch')
				.mockResolvedValue(jsonResponse({ data: [], meta: { totalCount: 0 } }));
			const result = useItems('posts');
			await result.refresh();
			expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('http://test-api.example.com'));
			vi.restoreAllMocks();
		});

		it('falls back to localhost when projectLogoUrl is absent', async () => {
			mockUseServerStore.mockReturnValue({
				info: ref({}),
				setInfo: vi.fn(),
			});
			const fetchSpy = vi
				.spyOn(globalThis, 'fetch')
				.mockResolvedValue(jsonResponse({ data: [], meta: { totalCount: 0 } }));
			const result = useItems('posts');
			await result.refresh();
			expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('localhost:8055'));
			vi.restoreAllMocks();
		});
	});

	describe('setPage', () => {
		it('updates page value and refreshes', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: [], meta: { totalCount: 0 } }));
			const result = useItems('posts');
			await result.setPage(3);
			expect(result.page.value).toBe(3);
			vi.restoreAllMocks();
		});
	});

	describe('setLimit', () => {
		it('updates limit, resets page to 1, and refreshes', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: [], meta: { totalCount: 0 } }));
			const result = useItems('posts', { limit: 20, page: 2 });
			await result.setLimit(10);
			expect(result.limit.value).toBe(10);
			expect(result.page.value).toBe(1);
			vi.restoreAllMocks();
		});
	});

	describe('setSort', () => {
		it('updates sort and refreshes', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: [], meta: { totalCount: 0 } }));
			const result = useItems('posts');
			await result.setSort('-created_at');
			expect(result.sort.value).toBe('-created_at');
			vi.restoreAllMocks();
		});
	});

	describe('setFilters', () => {
		it('updates filters, resets page to 1, and refreshes', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: [], meta: { totalCount: 0 } }));
			const result = useItems('posts');
			await result.setFilters({ status: 'draft' });
			expect(result.filters.value).toEqual({ status: 'draft' });
			expect(result.page.value).toBe(1);
			vi.restoreAllMocks();
		});
	});

	describe('createItem', () => {
		it('creates item via POST and returns result on success', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: { id: 'new-1', title: 'New Post' } }));
			const result = useItems('posts');
			const created = await result.createItem({ title: 'New Post' });
			expect(created).toEqual({ id: 'new-1', title: 'New Post' });
			vi.restoreAllMocks();
		});

		it('returns null on create error', async () => {
			vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Bad request'));
			const result = useItems('posts');
			const created = await result.createItem({ title: 'X' });
			expect(created).toBeNull();
			vi.restoreAllMocks();
		});

		it('returns null when server info missing', async () => {
			mockUseServerStore.mockReturnValue({
				info: ref(null),
				setInfo: vi.fn(),
			});
			const result = useItems('posts');
			const created = await result.createItem({ title: 'X' });
			expect(created).toBeNull();
			expect(result.error.value?.message).toBe('Server info not available');
		});
	});

	describe('updateItem', () => {
		it('patches item and returns result on success', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ data: { id: '1', title: 'Updated' } }));
			const result = useItems('posts');
			const updated = await result.updateItem('1', { title: 'Updated' });
			expect(updated).toEqual({ id: '1', title: 'Updated' });
			vi.restoreAllMocks();
		});

		it('returns null on update error', async () => {
			vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Not found'));
			const result = useItems('posts');
			const updated = await result.updateItem('1', {});
			expect(updated).toBeNull();
			vi.restoreAllMocks();
		});
	});

	describe('deleteItem', () => {
		it('deletes item and returns true on success', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 204 }));
			const result = useItems('posts');
			const deleted = await result.deleteItem('1');
			expect(deleted).toBe(true);
			vi.restoreAllMocks();
		});

		it('returns false on delete non-ok response', async () => {
			vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }));
			const result = useItems('posts');
			const deleted = await result.deleteItem('1');
			expect(deleted).toBe(false);
			vi.restoreAllMocks();
		});

		it('returns false when server info missing', async () => {
			mockUseServerStore.mockReturnValue({
				info: ref(null),
				setInfo: vi.fn(),
			});
			const result = useItems('posts');
			const deleted = await result.deleteItem('1');
			expect(deleted).toBe(false);
		});
	});
});
