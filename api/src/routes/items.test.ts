import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { NotFoundError } from '@directus/errors';
import { itemsRouter } from './items.js';

const testApp = express();
testApp.use(express.json());
testApp.use('/', itemsRouter);

describe('GET /items/:collection', () => {
	it('returns paginated items for a known collection', async () => {
		const response = await request(testApp).get('/demo_items');

		expect(response.status).toBe(200);
		expect(response.body.data).toHaveLength(3);
		expect(response.body.meta.totalCount).toBe(3);
		expect(response.body.meta.page).toBe(1);
		expect(response.body.meta.pageSize).toBe(20);
		expect(response.body.meta.lastPage).toBe(1);
	});

	it('returns 404 for an unknown collection', async () => {
		const response = await request(testApp).get('/nonexistent_collection');

		expect(response.status).toBe(new NotFoundError().status);
		expect(response.body.code).toBe('NOT_FOUND');
	});

	it('respects a custom page size', async () => {
		const response = await request(testApp).get('/demo_items').query({ limit: 2 });

		expect(response.status).toBe(200);
		expect(response.body.data).toHaveLength(2);
		expect(response.body.meta.pageSize).toBe(2);
		expect(response.body.meta.lastPage).toBe(2);
	});

	it('paginates correctly across pages', async () => {
		const firstPage = await request(testApp).get('/demo_items').query({ page: 1, limit: 2 });

		const secondPage = await request(testApp).get('/demo_items').query({ page: 2, limit: 2 });

		expect(firstPage.status).toBe(200);
		expect(secondPage.status).toBe(200);
		expect(firstPage.body.meta.page).toBe(1);
		expect(secondPage.body.meta.page).toBe(2);
		expect(firstPage.body.data).toHaveLength(2);
		expect(secondPage.body.data).toHaveLength(1);
	});

	it('caps page size at max', async () => {
		const response = await request(testApp).get('/demo_items').query({ limit: 9999 });

		expect(response.status).toBe(200);
		expect(response.body.meta.pageSize).toBeLessThanOrEqual(100);
	});
});

describe('POST /items/:collection', () => {
	it('creates a new item with title and status', async () => {
		const response = await request(testApp)
			.post('/demo_items')
			.send({ title: 'New item', status: 'published' });

		expect(response.status).toBe(201);
		expect(response.body.data).toMatchObject({
			title: 'New item',
			status: 'published',
			collection: 'demo_items',
			id: expect.any(String),
		});
	});

	it('returns 404 for unknown collection', async () => {
		const response = await request(testApp)
			.post('/unknown')
			.send({ title: 'test' });

		expect(response.status).toBe(new NotFoundError().status);
		expect(response.body.code).toBe('NOT_FOUND');
	});
});
