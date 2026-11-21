import request from 'supertest';
import express from 'express';
import { describe, expect, it } from 'vitest';
import { filesRouter } from './files.js';

/** Wrap the router in an Express app for supertest compatibility. */
const testApp = express();
testApp.use(express.json());
testApp.use('/', filesRouter);

describe('POST /files (upload)', () => {
	it('creates a file record and returns 201', async () => {
		const response = await request(testApp)
			.post('/')
			.set('Authorization', 'Bearer user-1')
			.send({ filename: 'photo.jpg', mimeType: 'image/jpeg' });

		expect(response.status).toBe(201);
		expect(response.body.data.filename).toBe('photo.jpg');
		expect(response.body.data.mimeType).toBe('image/jpeg');
		expect(response.body.data.id).toBeDefined();
		expect(response.body.data.uploadedAt).toBeGreaterThan(0);
	});

	it('rejects upload without a filename', async () => {
		const response = await request(testApp)
			.post('/')
			.set('Authorization', 'Bearer user-1')
			.send({ mimeType: 'text/plain' });

		expect(response.status).toBe(401);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('defaults collection to null and mimeType when omitted', async () => {
		const response = await request(testApp)
			.post('/')
			.set('Authorization', 'Bearer user-1')
			.send({ filename: 'doc.txt' });

		expect(response.status).toBe(201);
		expect(response.body.data.collection).toBeNull();
		expect(response.body.data.mimeType).toBe('application/octet-stream');
	});
});

describe('GET /files (list)', () => {
	it('lists all uploaded files with metadata', async () => {
		// Create one file first
		await request(testApp)
			.post('/')
			.set('Authorization', 'Bearer user-1')
			.send({ filename: 'img.png' });

		const response = await request(testApp)
			.get('/')
			.set('Authorization', 'Bearer user-1');

		expect(response.status).toBe(200);
		expect(Array.isArray(response.body.data)).toBe(true);
		expect(response.body.meta.totalCount).toBeGreaterThanOrEqual(1);
	});
});

describe('GET /files/:id (detail)', () => {
	it('returns the file record for a known id', async () => {
		const createRes = await request(testApp)
			.post('/')
			.set('Authorization', 'Bearer user-2')
			.send({ filename: 'report.pdf' });
		const fileId = createRes.body.data.id;

		const getRes = await request(testApp)
			.get(`/${fileId}`)
			.set('Authorization', 'Bearer user-2');

		expect(getRes.status).toBe(200);
		expect(getRes.body.data.filename).toBe('report.pdf');
		expect(getRes.body.data.id).toBe(fileId);
	});

	it('returns 404 for a non-existent file', async () => {
		const response = await request(testApp)
			.get('/nonexistent-id')
			.set('Authorization', 'Bearer user-2');

		expect(response.status).toBe(404);
		expect(response.body.code).toBe('NOT_FOUND');
	});
});
