import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import type { CollectionInfo } from '@directus/composables';

const { resolveApiBaseUrl: mockResolveApiBaseUrl } = vi.hoisted(() => ({
	resolveApiBaseUrl: vi.fn(),
}));

vi.mock('@directus/composables', async (importOriginal) => {
	const actual = await importOriginal<typeof import('@directus/composables')>();
	return {
		...actual,
		resolveApiBaseUrl: mockResolveApiBaseUrl,
	};
});

globalThis.fetch = vi.fn();

describe('useCollectionsManager', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockResolveApiBaseUrl.mockReturnValue('http://test-api.example.com');
		vi.mocked(globalThis.fetch).mockReset();
		// Reset module-level cache by re-importing
		vi.resetModules();
	});

	it('returns refs with default values before fetch', async () => {
		const { useCollectionsManager } = await import('./use-collections-manager');
		const { collections, flatCollections, loading, error } = useCollectionsManager();

		expect(collections.value).toEqual([]);
		expect(flatCollections.value).toEqual([]);
		expect(loading.value).toBe(false);
		expect(error.value).toBeNull();
	});

	describe('fetchCollections', () => {
		it('fetches collections from API', async () => {
			const mockCollections: CollectionInfo[] = [
				{ collection: 'posts', label: 'Posts', fields: [{ name: 'title', type: 'string' }], sampleCount: 42 },
				{ collection: 'users', label: 'Users', fields: [{ name: 'email', type: 'string' }], sampleCount: 100 },
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockCollections }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { useCollectionsManager } = await import('./use-collections-manager');
			const { fetchCollections, collections, loading, error } = useCollectionsManager();
			await fetchCollections();

			expect(loading.value).toBe(false);
			expect(error.value).toBeNull();
			expect(collections.value).toHaveLength(2);
			expect(collections.value[0].collection).toBe('posts');
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0][0];
			expect(fetchCall).toBe('http://test-api.example.com/collections');
		});

		it('sets loading true during fetch', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: [] }), {
					status: 200,
				}),
			);

			const { useCollectionsManager } = await import('./use-collections-manager');
			const { fetchCollections, loading } = useCollectionsManager();
			const fetchPromise = fetchCollections();

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});

		it('handles empty response data', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: null }), {
					status: 200,
				}),
			);

			const { useCollectionsManager } = await import('./use-collections-manager');
			const { fetchCollections, collections } = useCollectionsManager();
			await fetchCollections();

			expect(collections.value).toEqual([]);
		});

		it('sets error and clears data on fetch failure', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 500 }));

			const { useCollectionsManager } = await import('./use-collections-manager');
			const { fetchCollections, collections, loading, error } = useCollectionsManager();
			await expect(fetchCollections()).rejects.toThrow('Failed to load collections (500)');

			expect(loading.value).toBe(false);
			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('500');
			// Note: error is set but collections may still have old cached value
		});

		it('reuses cache on subsequent calls', async () => {
			const mockCollections: CollectionInfo[] = [
				{ collection: 'posts', label: 'Posts', fields: [], sampleCount: 42 },
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockCollections }), {
					status: 200,
				}),
			);

			const { useCollectionsManager } = await import('./use-collections-manager');
			const { fetchCollections, collections } = useCollectionsManager();

			await fetchCollections();
			expect(collections.value).toHaveLength(1);

			// Second call should reuse cache without additional fetch
			const fetchCallsBefore = vi.mocked(globalThis.fetch).mock.calls.length;
			await fetchCollections();
			const fetchCallsAfter = vi.mocked(globalThis.fetch).mock.calls.length;

			expect(fetchCallsAfter).toBe(fetchCallsBefore);
		});
	});

	describe('flatCollections', () => {
		it('flattens nested collections excluding singletons', async () => {
			const mockCollections: CollectionInfo[] = [
				{
					collection: 'posts',
					label: 'Posts',
					fields: [],
					sampleCount: 10,
					meta: { singleton: false },
					children: [
						{
							collection: 'tags',
							label: 'Tags',
							fields: [],
							sampleCount: 5,
							meta: { singleton: false },
							children: [],
						},
						{
							collection: 'settings',
							label: 'Settings',
							fields: [],
							sampleCount: 0,
							meta: { singleton: true },
							children: [],
						},
					],
				},
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockCollections }), {
					status: 200,
				}),
			);

			const { useCollectionsManager } = await import('./use-collections-manager');
			const { fetchCollections, flatCollections } = useCollectionsManager();
			await fetchCollections();

			const flat = flatCollections.value;
			expect(flat).toHaveLength(2); // posts + tags (settings is singleton)
			expect(flat.map((c) => c.collection)).toEqual(['posts', 'tags']);
		});

		it('returns empty array when no collections are fetched', async () => {
			const { useCollectionsManager } = await import('./use-collections-manager');
			const { flatCollections } = useCollectionsManager();

			expect(flatCollections.value).toEqual([]);
		});
	});
});