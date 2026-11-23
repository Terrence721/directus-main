import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { InvalidCredentialsError } from '@directus/errors';
import { activityRouter } from './activity.js';

const testApp = express();
testApp.use(express.json());
testApp.use('/', activityRouter);

const AUTH = { Authorization: 'Bearer user-001' };

describe('POST /activity', () => {
	it('rejects a request without an Authorization header', async () => {
		const response = await request(testApp).post('/').send({ action: 'created' });

		expect(response.status).toBe(new InvalidCredentialsError().status);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('rejects a non-Bearer Authorization header', async () => {
		const response = await request(testApp).post('/').set('Authorization', 'Basic abc123').send({ action: 'created' });

		expect(response.status).toBe(new InvalidCredentialsError().status);
	});

	it('rejects an empty Bearer token', async () => {
		const response = await request(testApp).post('/').set('Authorization', 'Bearer ').send({ action: 'created' });

		expect(response.status).toBe(new InvalidCredentialsError().status);
	});

	it('requires an action field', async () => {
		const response = await request(testApp).post('/').set(AUTH).send({ collection: 'demo_items' });

		expect(response.status).toBe(400);
		expect(response.body).toEqual({ code: 'INVALID_QUERY', message: 'Action is required.' });
	});

	it('treats an empty action string as missing', async () => {
		const response = await request(testApp).post('/').set(AUTH).send({ action: '' });

		expect(response.status).toBe(400);
		expect(response.body.code).toBe('INVALID_QUERY');
	});

	/**
	 * Documents current behavior: the middleware sets `userId` on the request but
	 * activity.ts checks for `userEmail`, which is never populated. The endpoint
	 * therefore returns 401 even with a valid Bearer token.
	 */
	it('returns 401 because the middleware never populates userEmail', async () => {
		const response = await request(testApp)
			.post('/')
			.set(AUTH)
			.send({ action: 'created', collection: 'demo_items', recordId: '1' });

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ code: 'UNAUTHORIZED', message: 'User email is required.' });
	});
});

describe('GET /activity', () => {
	it('rejects a request without an Authorization header', async () => {
		const response = await request(testApp).get('/');

		expect(response.status).toBe(new InvalidCredentialsError().status);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('returns an empty page with the expected meta shape', async () => {
		const response = await request(testApp).get('/').set(AUTH);

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			data: [],
			meta: { totalCount: 0, page: 1, pageSize: 20, lastPage: 0 },
		});
	});

	it('honours page and limit query params', async () => {
		const response = await request(testApp).get('/').set(AUTH).query({ page: 2, limit: 5 });

		expect(response.status).toBe(200);
		expect(response.body.meta.page).toBe(2);
		expect(response.body.meta.pageSize).toBe(5);
	});

	it('clamps limit to a maximum of 100', async () => {
		const response = await request(testApp).get('/').set(AUTH).query({ limit: 5000 });

		expect(response.body.meta.pageSize).toBe(100);
	});

	it('falls back to the default page size when limit is not a number', async () => {
		const response = await request(testApp).get('/').set(AUTH).query({ limit: 'abc' });

		expect(response.body.meta.pageSize).toBe(20);
	});

	it('falls back to page 1 when page is not a number', async () => {
		const response = await request(testApp).get('/').set(AUTH).query({ page: 'abc' });

		expect(response.body.meta.page).toBe(1);
	});

	it('computes lastPage as zero when there are no entries', async () => {
		const response = await request(testApp).get('/').set(AUTH);

		expect(response.body.meta.lastPage).toBe(0);
	});
});
