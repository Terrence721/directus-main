import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUsers } from './useUsers';

const { resolveApiBaseUrl: mockResolveApiBaseUrl } = vi.hoisted(() => ({
	resolveApiBaseUrl: vi.fn(() => 'http://test-api.example.com'),
}));

vi.mock('./useServer', () => ({
	resolveApiBaseUrl: mockResolveApiBaseUrl,
}));

globalThis.fetch = vi.fn();

describe('useUsers', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockResolveApiBaseUrl.mockReturnValue('http://test-api.example.com');
		vi.mocked(globalThis.fetch).mockReset();
	});

	it('returns refs with default values', () => {
		const { data, loading, error, fetchUsers } = useUsers();

		expect(data.value).toEqual([]);
		expect(loading.value).toBe(false);
		expect(error.value).toBeNull();
		expect(fetchUsers).toBeTypeOf('function');
	});

	it('accepts accessToken parameter', () => {
		const { fetchUsers } = useUsers('test-token');

		expect(fetchUsers).toBeTypeOf('function');
	});

	describe('fetchUsers', () => {
		it('does nothing when no accessToken provided', async () => {
			const { fetchUsers } = useUsers();

			await fetchUsers();

			expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
		});

		it('fetches users from API', async () => {
			const mockUsers = [
				{
					id: '1',
					email: 'user1@example.com',
					firstName: 'John',
					lastName: 'Doe',
					avatarUrl: 'http://example.com/avatar1.jpg',
				},
				{ id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', avatarUrl: null },
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockUsers, meta: {} }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { fetchUsers, data, loading, error } = useUsers('test-token');
			await fetchUsers();

			expect(loading.value).toBe(false);
			expect(error.value).toBeNull();
			expect(data.value).toEqual(mockUsers);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0][0];
			expect(fetchCall).toBe('http://test-api.example.com/users');

			const options = vi.mocked(globalThis.fetch).mock.calls[0][1];
			expect(options?.headers).toEqual({ Authorization: 'Bearer test-token' });
		});

		it('sets loading true during fetch', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: [], meta: {} }), {
					status: 200,
				}),
			);

			const { fetchUsers, loading } = useUsers('test-token');
			const fetchPromise = fetchUsers();

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});

		it('sets error and clears data on fetch failure', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 401 }));

			const { fetchUsers, data, loading, error } = useUsers('invalid-token');
			await fetchUsers();

			expect(loading.value).toBe(false);
			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('401');
			expect(data.value).toEqual([]);
		});

		it('sets error on non-OK response', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ message: 'Not found' }), { status: 404 }),
			);

			const { fetchUsers, error, data } = useUsers('test-token');
			await fetchUsers();

			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('404');
			expect(data.value).toEqual([]);
		});

		it('sets error when response.json throws', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response('invalid json', { status: 200 }));

			const { fetchUsers, error, data } = useUsers('test-token');
			await fetchUsers();

			expect(error.value).toBeInstanceOf(Error);
			expect(error.value?.message).toContain('Unexpected token');
			expect(data.value).toEqual([]);
		});
	});
});
