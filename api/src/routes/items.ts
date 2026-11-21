import { NotFoundError } from '@directus/errors';
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

	// Parse query parameters
	const queryLimit = parseInt(req.query.limit as string, 10);
	const limit = Number.isFinite(queryLimit) && queryLimit > 0 ? Math.min(queryLimit, MAX_LIMIT) : DEFAULT_LIMIT;

	const page = parseInt(req.query.page as string, 10) || 1;
	const sort = req.query.sort as string || '';
	const filters = req.query;

	// Apply filters
	let filteredData = data;
	if (filters) {
		// Remove pagination and sort params from filters
		const filterKeys = Object.keys(filters).filter(key =>
			!['limit', 'page', 'sort'].includes(key)
		);

		filteredData = filteredData.filter(item => {
			return filterKeys.every(key => {
				const filterValue = filters[key];
				// Simple exact match for now - in real Directus this would be more complex
				return (item as Record<string, unknown>)[key] === filterValue;
			});
		});
	}

	// Apply sort
	let sortedData = filteredData;
	if (sort) {
		const [sortField, sortOrder] = sort.startsWith('-') ? [sort.slice(1), 'desc'] : [sort, 'asc'];
		sortedData = [...filteredData].sort((a, b) => {
			const aValue = (a as Record<string, unknown>)[sortField];
			const bValue = (b as Record<string, unknown>)[sortField];

			if (aValue === null || aValue === undefined) return sortOrder === 'asc' ? -1 : 1;
			if (bValue === null || bValue === undefined) return sortOrder === 'asc' ? 1 : -1;

			if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
			return 0;
		});
	}

	const total = sortedData.length;
	const start = (page - 1) * limit;
	const end = Math.min(start + limit, total);

	res.json({
		data: sortedData.slice(start, end),
		meta: {
			totalCount: total,
			page,
			pageSize: limit,
			lastPage: Math.ceil(total / limit),
		},
	});
});
