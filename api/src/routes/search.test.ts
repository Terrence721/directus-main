import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { searchRouter } from './search.js';

const testApp = express();
testApp.use(express.json());
testApp.use('/', searchRouter);

describe('GET /search', () => {
	it('returns an empty result set for a blank query', async () => {
		const response = await request(testApp).get('/');

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual([]);
		expect(response.body.meta.totalCount).toBe(0);
	});

	it('treats a whitespace-only query as blank', async () => {
		const response = await request(testApp).get('/').query({ q: '   ' });

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual([]);
	});

	it('matches text case-insensitively', async () => {
		const response = await request(testApp).get('/').query({ q: 'FIRST' });

		expect(response.status).toBe(200);
		expect(response.body.data).toHaveLength(1);
		expect(response.body.data[0].title).toBe('First item');
	});

	it('returns fully-hydrated rows including collection and id', async () => {
		const response = await request(testApp).get('/').query({ q: 'first' });

		expect(response.body.data[0]).toMatchObject({
			collection: 'demo_items',
			id: '1',
			title: 'First item',
			status: 'published',
		});
	});

	it('searches across every collection by default', async () => {
		const response = await request(testApp).get('/').query({ q: 'o' });

		const collections = new Set(response.body.data.map((row: { collection: string }) => row.collection));

		expect(collections.size).toBeGreaterThan(1);
	});

	it('restricts results to the named collection', async () => {
		const response = await request(testApp).get('/').query({ q: 'item', collections: 'demo_items' });

		expect(response.status).toBe(200);
		expect(response.body.data.length).toBeGreaterThan(0);
		for (const row of response.body.data) {
			expect(row.collection).toBe('demo_items');
		}
	});

	it('accepts repeated collections params as an array', async () => {
		const response = await request(testApp)
			.get('/')
			.query({ q: 'o', collections: ['demo_items', 'demo_pages'] });

		expect(response.status).toBe(200);
		for (const row of response.body.data) {
			expect(['demo_items', 'demo_pages']).toContain(row.collection);
		}
	});

	it('applies extra query params as substring filters', async () => {
		const response = await request(testApp).get('/').query({ q: 'item', status: 'published' });

		expect(response.status).toBe(200);
		expect(response.body.data.length).toBeGreaterThan(0);
		for (const row of response.body.data) {
			expect(row.status).toBe('published');
		}
	});

	it('returns nothing when a filter excludes every hit', async () => {
		const response = await request(testApp).get('/').query({ q: 'first', status: 'draft' });

		expect(response.status).toBe(200);
		expect(response.body.data).toEqual([]);
		expect(response.body.meta.totalCount).toBe(0);
	});

	it('paginates with limit and page', async () => {
		const first = await request(testApp).get('/').query({ q: 'o', limit: 1, page: 1 });
		const second = await request(testApp).get('/').query({ q: 'o', limit: 1, page: 2 });

		expect(first.body.data).toHaveLength(1);
		expect(first.body.meta.page).toBe(1);
		expect(second.body.meta.page).toBe(2);
		expect(first.body.data[0].id).not.toBe(second.body.data[0].id);
	});

	it('clamps limit to a maximum of 100', async () => {
		const response = await request(testApp).get('/').query({ q: 'o', limit: 5000 });

		expect(response.body.meta.pageSize).toBe(100);
	});

	it('falls back to the default page size when limit is not a number', async () => {
		const response = await request(testApp).get('/').query({ q: 'o', limit: 'abc' });

		expect(response.body.meta.pageSize).toBe(20);
	});

	it('reports lastPage from the total hit count', async () => {
		const response = await request(testApp).get('/').query({ q: 'o', limit: 1 });

		expect(response.body.meta.lastPage).toBe(response.body.meta.totalCount);
	});
});
