import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { usersRouter } from './users.js';

const testApp = express();
testApp.use('/', usersRouter);

describe('GET /users/me', () => {
	it('returns the authenticated user profile', async () => {
		const response = await request(testApp)
			.get('/me')
			.set('Authorization', 'Bearer user-001');

		expect(response.status).toBe(200);
		expect(response.body.user).toMatchObject({
			email: 'demo@directus-main.dev',
			firstName: 'Demo',
			lastName: 'User',
		});
	});

	it('rejects requests without an Authorization header', async () => {
		const response = await request(testApp).get('/me');

		expect(response.status).toBe(401);
		expect(response.body).toEqual({
			code: 'INVALID_CREDENTIALS',
			message: 'Invalid user credentials.',
		});
	});

	it('rejects requests with an invalid token', async () => {
		const response = await request(testApp)
			.get('/me')
			.set('Authorization', 'Bearer invalid-token');

		expect(response.status).toBe(401);
	});
});
