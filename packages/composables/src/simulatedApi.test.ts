import { describe, expect, it, beforeEach } from 'vitest';
import { handleSimulatedRequest, resetSimulatedApi } from './simulatedApi';

beforeEach(() => {
	resetSimulatedApi();
});

describe('simulatedApi.handleSimulatedRequest', () => {
	describe('GET /collections', () => {
		it('lists demo collections with live sample counts', async () => {
			const res = handleSimulatedRequest('/collections');
			expect(res.ok).toBe(true);
			const body = (await res.json()) as { data: Array<Record<string, unknown>> };
			expect(body.data.map((c) => c.collection)).toEqual(['demo_items', 'demo_pages']);
			expect(body.data[0].sampleCount).toBe(3);
		});

		it('returns a single collection detail', async () => {
			const res = handleSimulatedRequest('/collections/demo_pages');
			const body = (await res.json()) as { data: { collection: string } };
			expect(body.data.collection).toBe('demo_pages');
		});

		it('404s for unknown collections', () => {
			const res = handleSimulatedRequest('/collections/nope');
			expect(res.status).toBe(404);
		});
	});

	describe('/items', () => {
		it('paginates items and reports meta', async () => {
			const res = handleSimulatedRequest('/items/demo_items?limit=2&page=2');
			const body = (await res.json()) as { data: unknown[]; meta: { totalCount: number; page: number } };
			expect(body.data).toHaveLength(1);
			expect(body.data[0]).toMatchObject({ id: '3' });
			expect(body.meta.totalCount).toBe(3);
			expect(body.meta.page).toBe(2);
		});

		it('applies _icontains filters and sort', async () => {
			const res = handleSimulatedRequest('/items/demo_items?status=_icontains|draft&sort=-id');
			const body = (await res.json()) as { data: Array<Record<string, unknown>> };
			expect(body.data.map((r) => r.id)).toEqual(['2']);
		});

		it('creates, updates, and deletes items in place', async () => {
			const created = handleSimulatedRequest('/items/demo_items', {
				method: 'POST',
				body: JSON.stringify({ title: 'Fourth item' }),
			});
			expect(created.status).toBe(201);
			const createdBody = (await created.json()) as { data: Record<string, unknown> };

			const patched = handleSimulatedRequest('/items/demo_items/1', {
				method: 'PATCH',
				body: JSON.stringify({ status: 'draft' }),
			});
			const patchedBody = (await patched.json()) as { data: Record<string, unknown> };
			expect(patchedBody.data.status).toBe('draft');

			const deleted = handleSimulatedRequest('/items/demo_items/1', { method: 'DELETE' });
			expect(deleted.status).toBe(200);

			const after = handleSimulatedRequest('/items/demo_items');
			const body = (await after.json()) as { data: Array<Record<string, unknown>> };
			expect(body.data.map((r) => r.id)).toEqual(['2', '3', createdBody.data.id]);
		});

		it('404s for unknown collections and items', () => {
			expect(handleSimulatedRequest('/items/nope').status).toBe(404);
			expect(handleSimulatedRequest('/items/demo_items/999').status).toBe(404);
		});
	});

	describe('/users', () => {
		it('lists the demo user', async () => {
			const res = handleSimulatedRequest('/users');
			const body = (await res.json()) as { data: Array<{ id: string; email: string }> };
			expect(body.data[0].id).toBe('user-001');
			expect(body.data[0].email).toBe('demo@directus-main.dev');
		});

		it('patches /users/me and returns both user and data', async () => {
			const res = handleSimulatedRequest('/users/me', {
				method: 'PATCH',
				body: JSON.stringify({ firstName: 'Renamed' }),
			});
			const body = (await res.json()) as { user: { firstName: string }; data: { firstName: string } };
			expect(body.user.firstName).toBe('Renamed');
			expect(body.data.firstName).toBe('Renamed');
		});
	});

	describe('/files and /assets', () => {
		it('lists files and accepts uploads via both routes', async () => {
			const form = new FormData();
			form.append('file', new File(['x'], 'notes.txt', { type: 'text/plain' }));
			expect(handleSimulatedRequest('/files', { method: 'POST', body: form }).status).toBe(201);
			expect(handleSimulatedRequest('/assets', { method: 'POST', body: form }).status).toBe(201);

			const res = handleSimulatedRequest('/files');
			const body = (await res.json()) as { data: Array<{ filename: string }> };
			expect(body.data.map((f) => f.filename)).toEqual(['notes.txt', 'notes.txt']);
		});

		it('falls back to a generated filename when no file is sent', async () => {
			const res = handleSimulatedRequest('/files', { method: 'POST' });
			const body = (await res.json()) as { data: { filename: string } };
			expect(body.data.filename).toMatch(/^upload-/);
		});
	});

	describe('/activity', () => {
		it('records posted activity and lists it on GET', async () => {
			expect(
				handleSimulatedRequest('/activity', {
					method: 'POST',
					body: JSON.stringify({ action: 'create', collection: 'demo_items', recordId: '4' }),
				}).status,
			).toBe(201);

			const res = handleSimulatedRequest('/activity');
			const body = (await res.json()) as { data: Array<{ action: string; collection: string | null }> };
			expect(body.data[0]).toMatchObject({ action: 'create', collection: 'demo_items' });
		});
	});

	describe('/search', () => {
		it('returns empty results for a blank query', async () => {
			const res = handleSimulatedRequest('/search?q=');
			const body = (await res.json()) as { data: unknown[]; meta: { totalCount: number } };
			expect(body.data).toEqual([]);
			expect(body.meta.totalCount).toBe(0);
		});

		it('matches text across collections and respects collection scoping', async () => {
			const res = handleSimulatedRequest('/search?q=contact&collections[]=demo_pages');
			const body = (await res.json()) as { data: Array<Record<string, unknown>> };
			expect(body.data).toHaveLength(1);
			expect(body.data[0].collection).toBe('demo_pages');
		});
	});

	describe('fallbacks', () => {
		it('404s for unknown roots', () => {
			expect(handleSimulatedRequest('/no-such-thing').status).toBe(404);
		});
	});
});
