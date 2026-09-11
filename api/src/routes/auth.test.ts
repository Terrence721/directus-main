import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../index.js';

describe('POST /auth/login', () => {
	it('returns a session for the demo account', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({ email: 'demo@directus-main.dev', password: 'demo1234' });

		expect(response.status).toBe(200);
		expect(response.body).toEqual({
			accessToken: expect.stringMatching(/^demo-\d+$/),
			expiresAt: expect.any(Number),
		});
	});

	it('rejects the wrong password', async () => {
		const response = await request(app)
			.post('/auth/login')
			.send({ email: 'demo@directus-main.dev', password: 'wrong' });

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ code: 'INVALID_CREDENTIALS', message: 'Invalid user credentials.' });
	});

	it('rejects a missing body', async () => {
		const response = await request(app).post('/auth/login').send({});

		expect(response.status).toBe(401);
		expect(response.body).toEqual({ code: 'INVALID_CREDENTIALS', message: 'Invalid user credentials.' });
	});
});
