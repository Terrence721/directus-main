import request from 'supertest';
import express from 'express';
import { describe, expect, it } from 'vitest';
import { collectionsRouter } from './collections.js';

const testApp = express();
testApp.use('/', collectionsRouter);

describe('GET /collections', () => {
	it('returns demo_items collection metadata', async () => {
		const response = await request(testApp).get('/');
		expect(response.status).toBe(200);
		expect(response.body.data).toBeInstanceOf(Array);
		const itemsCollection = response.body.data.find((c: { collection: string }) => c.collection === 'demo_items');
		expect(itemsCollection).toBeDefined();
		expect(itemsCollection.label).toBe('Demo Items');
		expect(itemsCollection.fields).toBeInstanceOf(Array);
	});
});
