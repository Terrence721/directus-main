import { ForbiddenError, InvalidCredentialsError, NotFoundError } from '@directus/errors';
import { Router } from 'express';
import { ITEMS } from './demo-data.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const itemsRouter = Router();

itemsRouter.get('/:collection', (req, res) => {
	const collection = req.params.collection;
	const data = ITEMS[collection];

	if (!data) {
		const error = new NotFoundError(`Collection "${collection}" not found.`);
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const queryLimit = parseInt(req.query.limit as string, 10);
	const limit = Number.isFinite(queryLimit) && queryLimit > 0
		? Math.min(queryLimit, MAX_LIMIT)
		: DEFAULT_LIMIT;

	const total = data.length;
	const page = parseInt(req.query.page as string, 10) || 1;
	const start = (page - 1) * limit;
	const end = Math.min(start + limit, total);

	res.json({
		data: data.slice(start, end),
		meta: {
			totalCount: total,
			page,
			pageSize: limit,
			lastPage: Math.ceil(total / limit),
		},
	});
});
