import { Router } from 'express';
import { ITEMS } from './demo-data.js';

export const searchRouter = Router();

searchRouter.get('/', (req, res) => {
	const q = String(req.query.q ?? '')
		.trim()
		.toLowerCase();
	if (!q) {
		res.json({ data: [], meta: { totalCount: 0 } });
		return;
	}

	const limit = Math.min(Number(req.query.limit ?? 20) || 20, 100);
	const page = Number(req.query.page ?? 1) || 1;
	const selectedCollections = req.query.collections
		? Array.isArray(req.query.collections)
			? req.query.collections
			: [req.query.collections]
		: [];

	// Filter params exclude metadata keys
	const filterKeys = Object.keys(req.query).filter((k) => !['q', 'limit', 'page', 'sort', 'collections'].includes(k));
	const filters = Object.fromEntries(filterKeys.map((k) => [k, req.query[k]]));

	const hits: Array<{ collection: string; id: string }> = [];

	for (const [collectionName, items] of Object.entries(ITEMS)) {
		if (selectedCollections.length > 0 && !selectedCollections.includes(collectionName)) continue;

		for (const item of items) {
			const row = item as Record<string, unknown>;

			// Check text match against searchable string fields
			const textMatch = Object.values(row)
				.filter((v): v is string => typeof v === 'string')
				.some((v) => v.toLowerCase().includes(q));
			if (!textMatch) continue;

			// Apply any direct equality filters
			const passesFilters = filterKeys.every((key) => {
				const expected = String(row[key] ?? '');
				const given = String(filters[key] ?? '');
				return expected.toLowerCase().includes(given.toLowerCase());
			});
			if (!passesFilters) continue;

			hits.push({ collection: collectionName, id: String(row.id) });
		}
	}

	const total = hits.length;
	const start = (page - 1) * limit;
	const pageHits = hits.slice(start, start + limit);

	const data = pageHits.map(({ collection, id }) => ({
		collection,
		id,
		...(ITEMS[collection]?.find((item) => String(item.id) === id) ?? {}),
	}));

	res.json({ data, meta: { totalCount: total, page, pageSize: limit, lastPage: Math.ceil(total / limit) } });
});
