import request from 'supertest';
import express, { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { requireAuth, rateLimit, requestLogger } from './middleware.js';

// --- requireAuth ---

describe('requireAuth', () => {
	it('passes when a valid Bearer token is provided', async () => {
		const app = express();
		app.use((req: Request & { userId?: string }, _res: Response, next) => {
			requireAuth(req, _res, next);
		});
		app.get('/test', (req, res) => {
			res.json({ userId: (req as Request & { userId: string }).userId });
		});

		const response = await request(app).get('/test').set('Authorization', 'Bearer test-token-123');

		expect(response.status).toBe(200);
		expect(response.body.userId).toBe('test-token-123');
	});

	it('returns 401 when Authorization header is missing', async () => {
		const app = express();
		app.get('/test', (req, res) => {
			requireAuth(req as Request & { userId?: string }, res as Response, () => {});
		});

		const response = await request(app).get('/test');
		expect(response.status).toBe(401);
		expect(response.body.code).toBe('INVALID_CREDENTIALS');
	});

	it('returns 401 when Bearer token is empty', async () => {
		const app = express();
		app.get('/test', (req, res) => {
			requireAuth(req as Request & { userId?: string }, res as Response, () => {});
		});

		const response = await request(app).get('/test').set('Authorization', 'Bearer ');
		expect(response.status).toBe(401);
	});
});

// --- rateLimit ---

describe('rateLimit', () => {
	it('allows requests within the limit', async () => {
		const limiter = rateLimit(3, 60_000);
		const app = express();
		app.use(express.json());
		app.use(limiter);
		app.get('/', (_req, res) => res.json({ ok: true }));

		const r1 = await request(app).get('/');
		expect(r1.status).toBe(200);

		const r2 = await request(app).get('/');
		expect(r2.status).toBe(200);

		const r3 = await request(app).get('/');
		expect(r3.status).toBe(200);
	});

	it('returns 429 after exceeding the limit', async () => {
		const limiter = rateLimit(2, 60_000);
		const app = express();
		app.use(express.json());
		app.use(limiter);
		app.get('/', (_req, res) => res.json({ ok: true }));

		await request(app).get('/');
		await request(app).get('/');

		const r3 = await request(app).get('/');
		expect(r3.status).toBe(429);
		expect(r3.body.code).toBe('RATE_LIMITED');
	});
});

// --- requestLogger ---

describe('requestLogger', () => {
	it('logs method, path, status and duration on finish', async () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const app = express();
		app.use(express.json());
		app.use(requestLogger);
		app.get('/', (_req, res) => {
			res.json({ ok: true });
		});

		await request(app).get('/');
		expect(logSpy).toHaveBeenCalledOnce();
		const logged = logSpy.mock.calls[0][0] as string;
		expect(logged).toContain('GET');
		expect(logged).toContain('/');
		expect(logged).toContain('200');
		logSpy.mockRestore();
	});

	it('skips /health paths', async () => {
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		const app = express();
		app.use(express.json());
		app.use(requestLogger);
		app.get('/health', (_req, res) => res.json({ status: 'ok' }));

		await request(app).get('/health');
		expect(logSpy).not.toHaveBeenCalled();
		logSpy.mockRestore();
	});
});
