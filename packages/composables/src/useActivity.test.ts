import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useActivity } from './useActivity';

const { resolveApiBaseUrl: mockResolveApiBaseUrl } = vi.hoisted(() => ({
	resolveApiBaseUrl: vi.fn(() => 'http://test-api.example.com'),
}));

vi.mock('./useServer', () => ({
	resolveApiBaseUrl: mockResolveApiBaseUrl,
}));

globalThis.fetch = vi.fn();

describe('useActivity', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockResolveApiBaseUrl.mockReturnValue('http://test-api.example.com');
		vi.mocked(globalThis.fetch).mockReset();
	});

	it('returns refs with default values', () => {
		const { data, loading, error, fetchActivity, logActivity } = useActivity();

		expect(data.value).toEqual([]);
		expect(loading.value).toBe(false);
		expect(error.value).toBeNull();
		expect(fetchActivity).toBeTypeOf('function');
		expect(logActivity).toBeTypeOf('function');
	});

	it('accepts accessToken parameter', () => {
		const { fetchActivity, logActivity } = useActivity('test-token');

		expect(fetchActivity).toBeTypeOf('function');
		expect(logActivity).toBeTypeOf('function');
	});

	describe('fetchActivity', () => {
		it('does nothing when no accessToken provided', async () => {
			const { fetchActivity } = useActivity();

			await fetchActivity(1);

			expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
		});

		it('fetches activity from API with page parameter', async () => {
			const mockActivity = [
				{
					id: '1',
					action: 'create',
					collection: 'posts',
					recordId: 'post-1',
					userEmail: 'user@example.com',
					createdAt: 1234567890,
				},
				{
					id: '2',
					action: 'update',
					collection: 'users',
					recordId: 'user-1',
					userEmail: 'admin@example.com',
					createdAt: 1234567891,
				},
			];

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: mockActivity }), {
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}),
			);

			const { fetchActivity, data, loading, error } = useActivity('test-token');
			await fetchActivity(2);

			expect(loading.value).toBe(false);
			expect(error.value).toBeNull();
			expect(data.value).toEqual(mockActivity);
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			const fetchCall = vi.mocked(globalThis.fetch).mock.calls[0][0];
			expect(fetchCall).toBe('http://test-api.example.com/activity?page=2&limit=50');

			const options = vi.mocked(globalThis.fetch).mock.calls[0][1];
			expect(options?.headers).toEqual({ Authorization: 'Bearer test-token' });
		});

		it('sets loading true during fetch', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: [] }), {
					status: 200,
				}),
			);

			const { fetchActivity, loading } = useActivity('test-token');
			const fetchPromise = fetchActivity(1);

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});

		it('sets error and clears data on fetch failure', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 500 }));

			const { fetchActivity, data, loading, error } = useActivity('test-token');
			await fetchActivity(1);

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

			const { fetchActivity, data } = useActivity('test-token');
			await fetchActivity(1);

			expect(data.value).toEqual([]);
		});

		it('sets loading false even on error', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 500 }));

			const { fetchActivity, loading } = useActivity('test-token');
			const fetchPromise = fetchActivity(1);

			expect(loading.value).toBe(true);

			await fetchPromise;

			expect(loading.value).toBe(false);
		});
	});

	describe('logActivity', () => {
		it('does nothing when no accessToken provided', async () => {
			const { logActivity } = useActivity();

			await logActivity('test-action');

			expect(vi.mocked(globalThis.fetch)).not.toHaveBeenCalled();
		});

		it('logs activity and refreshes on success', async () => {
			vi.mocked(globalThis.fetch)
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ success: true }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					}),
				)
				.mockResolvedValueOnce(
					new Response(
						JSON.stringify({ data: [{ id: '1', action: 'test', userEmail: 'test@example.com', createdAt: 123 }] }),
						{
							status: 200,
							headers: { 'Content-Type': 'application/json' },
						},
					),
				);

			const { logActivity, data } = useActivity('test-token');
			await logActivity('test-action', 'posts', 'post-1');

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledTimes(2);

			const firstCall = vi.mocked(globalThis.fetch).mock.calls[0];
			expect(firstCall[0]).toBe('http://test-api.example.com/activity');
			const firstOptions = firstCall[1]!;
			expect(firstOptions.method).toBe('POST');
			expect(firstOptions.headers).toEqual({
				'Content-Type': 'application/json',
				Authorization: 'Bearer test-token',
			});
			expect(JSON.parse(firstOptions.body as string)).toEqual({
				action: 'test-action',
				collection: 'posts',
				recordId: 'post-1',
			});

			const secondCall = vi.mocked(globalThis.fetch).mock.calls[1];
			expect(secondCall[0]).toBe('http://test-api.example.com/activity?page=1&limit=50');

			expect(data.value).toEqual([{ id: '1', action: 'test', userEmail: 'test@example.com', createdAt: 123 }]);
		});

		it('silently ignores errors and does not throw', async () => {
			vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

			const { logActivity } = useActivity('test-token');
			await logActivity('test-action');

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
			// Should not throw
		});

		it('logs activity without optional collection and recordId', async () => {
			vi.mocked(globalThis.fetch)
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ success: true }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					}),
				)
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ data: [] }), {
						status: 200,
						headers: { 'Content-Type': 'application/json' },
					}),
				);

			const { logActivity } = useActivity('test-token');
			await logActivity('test-action');

			const firstCall = vi.mocked(globalThis.fetch).mock.calls[0];
			const firstOptions = firstCall[1]!;
			expect(JSON.parse(firstOptions.body as string)).toEqual({
				action: 'test-action',
				collection: undefined,
				recordId: undefined,
			});
		});
	});
});
