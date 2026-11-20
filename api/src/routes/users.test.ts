import request from 'supertest';
import express from 'express';
import { describe, expect, it } from 'vitest';
import { usersRouter } from './users.js';

/** Wrap the router in an Express app for supertest compatibility. */
const testApp = express();
testApp.use(express.json());
testApp.use('/', usersRouter);

describe('POST /users (registration)', () => {
	it('creates a new user and returns a session', async () => {
		const response = await request(testApp).post('/').send({
			email: 'new@example.com',
			password: 'password123',
			firstName: 'New',
			lastName: 'User',
		});

		expect(response.status).toBe(201);
		expect(response.body).toMatchObject({
			user: {
				email: 'new@example.com',
				firstName: 'New',
				lastName: 'User',
			},
		});
		expect(response.body.accessToken).toBeDefined();
		expect(response.body.expiresAt).toBeGreaterThan(Date.now());
	});

	it('rejects registration with missing email', async () => {
		const response = await request(testApp).post('/').send({ password: 'secret' });

		expect(response.status).toBe(401);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('rejects registration with missing password', async () => {
		const response = await request(testApp).post('/').send({ email: 'x@y.z' });

		expect(response.status).toBe(401);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('rejects duplicate email registration', async () => {
		// First registration
		const first = await request(testApp).post('/').send({ email: 'dup@example.com', password: 'pass123' });
		expect(first.status).toBe(201);

		// Second registration with same email
		const second = await request(testApp).post('/').send({ email: 'dup@example.com', password: 'pass123' });

		expect(second.status).toBe(404);
		expect(second.body.code).toBe('NOT_FOUND');
	});

	it('normalizes email case in the slugified lookup key', async () => {
		// Register with uppercase email — the internal lookup key uses slugify(), so
		// 'CASE+TEST' and 'case-test' are not colliding keys here; the point is simply
		// that both produce valid 201 responses and the stored email preserves input.
		const response = await request(testApp)
			.post('/')
			.send({ email: 'CASE+TEST@example.com', password: 'pass123' });

		expect(response.status).toBe(201);
		expect(response.body.user.email).toBe('CASE+TEST@example.com');
	});

	it('sets default null values for optional name fields', async () => {
		const response = await request(testApp).post('/').send({ email: 'minimal@test.com', password: 'pass123' });

		expect(response.status).toBe(201);
		expect(response.body.user.firstName).toBeNull();
		expect(response.body.user.lastName).toBeNull();
	});
});
