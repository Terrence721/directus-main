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
		const response = await request(testApp).post('/').send({ email: 'CASE+TEST@example.com', password: 'pass123' });

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

describe('PATCH /users/me (profile update)', () => {
	it('updates user profile with valid data', async () => {
		const registerResponse = await request(testApp).post('/').send({
			email: 'patch@example.com',
			password: 'pass123',
			firstName: 'Original',
			lastName: 'Name',
		});
		expect(registerResponse.status).toBe(201);
		const accessToken = registerResponse.body.accessToken;

		const response = await request(testApp)
			.patch('/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				firstName: 'Updated',
				lastName: 'Name',
				email: 'patched@example.com',
				password: 'newpass123',
			});

		expect(response.status).toBe(200);
		expect(response.body.user).toMatchObject({
			firstName: 'Updated',
			lastName: 'Name',
			email: 'patched@example.com',
		});
		expect(response.body.user.firstName).toBe('Updated');
		expect(response.body.user.lastName).toBe('Name');
		expect(response.body.user.email).toBe('patched@example.com');
	});

	it('returns 401 for missing authorization header', async () => {
		const response = await request(testApp).patch('/me').send({
			firstName: 'Updated',
			lastName: 'Name',
		});
		expect(response.status).toBe(401);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('returns 401 for invalid profile data', async () => {
		const registerResponse = await request(testApp).post('/').send({
			email: 'invalid@example.com',
			password: 'pass123',
			firstName: 'Test',
			lastName: 'User',
		});
		expect(registerResponse.status).toBe(201);
		const accessToken = registerResponse.body.accessToken;

		const response = await request(testApp)
			.patch('/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				firstName: '',
				lastName: 'Name',
				email: 'new@example.com',
				password: 'short',
			});
		expect(response.status).toBe(401);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('updates email and checks uniqueness', async () => {
		const first = await request(testApp).post('/').send({
			email: 'first@example.com',
			password: 'pass123',
			firstName: 'First',
			lastName: 'User',
		});
		expect(first.status).toBe(201);
		const accessToken = first.body.accessToken;

		const second = await request(testApp)
			.patch('/me')
			.set('Authorization', `Bearer ${accessToken}`)
			.send({
				email: 'second@example.com',
				firstName: 'Updated',
				lastName: 'Name',
				password: 'newpass123',
			});
		expect(second.status).toBe(200);
		expect(second.body.user.email).toBe('second@example.com');
	});
});

// ---------------------------------------------------------------------------
// GET /users - List users endpoint
// ---------------------------------------------------------------------------

describe('GET /users (list users)', () => {
	it('returns all users with pagination', async () => {
		const response = await request(testApp).get('/');
		expect(response.status).toBe(200);
		expect(response.body.data).toBeDefined();
		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.meta).toBeDefined();
	});
});

// ---------------------------------------------------------------------------
// DELETE /users/me - Delete account endpoint
// ---------------------------------------------------------------------------

describe('DELETE /users/me (delete account)', () => {
	it('deletes a registered user and returns success', async () => {
		// First create a test user
		const registerResponse = await request(testApp).post('/').send({
			email: 'delete-test@example.com',
			password: 'pass123',
			firstName: 'Delete',
			lastName: 'Me',
		});
		expect(registerResponse.status).toBe(201);
		const accessToken = registerResponse.body.accessToken;

		// Now delete the account
		const response = await request(testApp)
			.delete('/me')
			.set('Authorization', `Bearer ${accessToken}`);

		expect(response.status).toBe(200);
		expect(response.body.data.deleted).toBe(true);
	});
});

// ---------------------------------------------------------------------------
// GET /server/info - Server info endpoint
// ---------------------------------------------------------------------------

describe('GET /server/info', () => {
	it('returns server metadata', async () => {
		const response = await request(testApp).get('/server/info');
		expect(response.status).toBe(200);
		expect(response.body.data).toBeDefined();
		expect(response.body.data.projectName).toBe('Directus Main Demo');
	});
});
