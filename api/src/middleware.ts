import { Request, Response, NextFunction } from 'express';
import { InvalidCredentialsError } from '@directus/errors';

// Augment Express Request with our custom userId property
declare module 'express-serve-static-core' {
	interface Request {
		userId?: string;
	}
}

/** Typed request with authenticated userId */
export interface AuthenticatedRequest extends Request {
	userId: string;
}

/**
 * Extracts and validates a Bearer token from the Authorization header.
 * In this demo server tokens are user IDs issued at registration/login.
 * Real Directus would verify a JWT here; this stub trusts any non-empty Bearer value.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
	const authHeader = req.headers['authorization'];
	if (!authHeader?.startsWith('Bearer ')) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const token = authHeader.slice(7);
	if (!token) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	req.userId = token;
	next();
}

/**
 * Per-IP rate limiter. Returns 429 when more than `max` requests arrive
 * within `windowMs` milliseconds for the same IP.
 *
 * This is a process-local in-memory store suitable for single-node dev/demo.
 * A production build should replace it with Redis or a distributed cache.
 */
export function rateLimit(max: number, windowMs: number) {
	const windows = new Map<string, { count: number; resetAt: number }>();

	return function limiter(req: Request, res: Response, next: NextFunction): void {
		const ip = (req as unknown as Record<string, string>).ip || req.socket.remoteAddress || 'unknown';
		const now = Date.now();

		let entry = windows.get(ip);
		if (!entry || now > entry.resetAt) {
			entry = { count: 0, resetAt: now + windowMs };
			windows.set(ip, entry);
		}

		entry.count += 1;

		if (entry.count > max) {
			res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
			const error = new Error('Too many requests. Please try again later.');
			(res as Response).status(429).json({
				code: 'RATE_LIMITED',
				message: error.message,
			});
			return;
		}

		next();
	};
}

/**
 * Simple request logger that records method, path, status, and duration.
 * Skips health-check pings to keep logs clean.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
	const start = Date.now();
	const url = req.url;

	// Skip health checks
	if (url === '/health') {
		next();
		return;
	}

	res.on('finish', () => {
		const duration = Date.now() - start;
		console.log(`[${new Date().toISOString()}] ${req.method} ${url} → ${res.statusCode} (${duration}ms)`);
	});

	next();
}
