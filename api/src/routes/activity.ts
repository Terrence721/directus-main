import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware.js';
import type { AuthenticatedRequest } from '../middleware.js';

interface ActivityEntry {
	id: string;
	action: string;
	collection?: string | null;
	recordId?: string | null;
	userEmail: string;
	createdAt: number;
}

const entries: ActivityEntry[] = [];

export const activityRouter = Router();

/** POST /activity — Log an activity entry */
activityRouter.post('/', requireAuth, (req: Request, res: Response) => {
	const authenticatedReq = req as AuthenticatedRequest;
	const body = req.body as { action: string; collection?: string; recordId?: string };

	if (!body.action) {
		res.status(400).json({ code: 'INVALID_QUERY', message: 'Action is required.' });
		return;
	}
	if (!('userEmail' in authenticatedReq) || typeof authenticatedReq.userEmail !== 'string') {
		res.status(401).json({ code: 'UNAUTHORIZED', message: 'User email is required.' });
		return;
	}

	const entry: ActivityEntry = {
		id: `act-${Date.now()}`,
		action: body.action,
		collection: body.collection ?? null,
		recordId: body.recordId ?? null,
		userEmail: authenticatedReq.userEmail,
		createdAt: Date.now(),
	};

	entries.unshift(entry);
	res.status(201).json({ data: entry });
});

/** GET /activity — List recent activity entries */
activityRouter.get('/', requireAuth, (req: Request, res: Response) => {
	const page = Number(req.query.page ?? 1) || 1;
	const limit = Math.min(Number(req.query.limit ?? 20) || 20, 100);

	const total = entries.length;
	const start = (page - 1) * limit;
	const pageEntries = entries.slice(start, start + limit);

	res.json({
		data: pageEntries,
		meta: { totalCount: total, page, pageSize: limit, lastPage: Math.ceil(total / limit) },
	});
});
