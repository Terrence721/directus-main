import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCollections } from './useCollections';

const { resolveApiBaseUrl: mockResolveApiBaseUrl } = vi.hoisted(() => ({
	resolveApiBaseUrl: vi.fn(() => 'http://test-api.example.com'),
}));

vi.mock('./useServer', () => ({
	resolveApiBaseUrl: mockResolveApiBaseUrl,
}));

globalThis.fetch = vi.fn();

describe('useCollections', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockResolveApiBaseUrl.mockReturnValue('http://test-api.example.com');
		vi.mocked(globalThis.fetch).mockReset();
	});

	it('returns refs with default values', () => {
		const { data, loading, error, fetchCollections, getCollection } = useCollections();

		expect(data.value).toEqual([]);
		expect(loading.value).toBe(false);
		expect(error.value).toBeNull();
		expect(fetchCollections).toBeTypeOf('function');
		expect(getCollection).toBeTypeOf('function');
	});

	describe('fetchCollections', () => {
		it('fetches collections from API', async () => {
			const mockCollections = [
				{ collection: 'posts', label: 'Posts', fields: [{ name: 'title', type: 'string' }], sampleCount: 42 },
				{ collection: 'users', label: 'Users', fields: [{ name: 'email', type: 'string' }], sampleCount: 100 },
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockCollections }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { fetchCollections, data, loading, error } = useCollections();
			await fetchCollections();

			expect(loading.value).toBe(false);
			expect(error.value).toBeNull();
			expect(data.value).toEqual(mockCollections);
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

			const { fetchCollections, loading } = useCollections();
			const fetchPromise = fetchCollections();

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});

		it('sets error and clears data on fetch failure', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 500 }));

			const { fetchCollections, data, loading, error } = useCollections();
			await fetchCollections();

			expect(loading.value).toBe(false);
			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('500');
			expect(data.value).toEqual([]);
		});

		it('handles empty response data', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: null }), {
					status: 200,
				}),
			);

			const { fetchCollections, data } = useCollections();
			await fetchCollections();

			expect(data.value).toEqual([]);
		});
	});

	describe('getCollection', () => {
		it('finds a collection by name', () => {
			const mockCollections = [
				{ collection: 'posts', label: 'Posts', fields: [], sampleCount: 10 },
				{ collection: 'users', label: 'Users', fields: [], sampleCount: 5 },
			];

			const { data, getCollection } = useCollections();
			data.value = mockCollections;

			const result = getCollection('posts');

			expect(result).toBeDefined();
			expect(result).toEqual(mockCollections[0]);
		});

		it('returns undefined when collection not found', () => {
			const { data, getCollection } = useCollections();
			data.value = [{ collection: 'posts', label: 'Posts', fields: [], sampleCount: 10 }];

			const result = getCollection('nonexistent');

			expect(result).toBeUndefined();
		});

		it('returns undefined when data is empty', () => {
			const { data, getCollection } = useCollections();
			data.value = [];

			const result = getCollection('any-collection');

			expect(result).toBeUndefined();
		});
	});
});
