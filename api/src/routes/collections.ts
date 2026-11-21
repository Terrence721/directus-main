import { Router } from 'express';
import { ITEMS } from './demo-data.js';

export const collectionsRouter = Router();

/** GET /collections — Returns collection metadata + live sample counts from the item store. */
collectionsRouter.get('/', (_req, res) => {
	const data = [
		{
			collection: 'demo_items',
			label: 'Demo Items',
			fields: [
				{ name: 'id', type: 'string' },
				{ name: 'title', type: 'string' },
				{ name: 'status', type: 'string' },
			],
			sampleCount: 0,
		},
	];

	// Populate sample counts from the live demo store
	for (const coll of data) {
		coll.sampleCount = (ITEMS[coll.collection] ?? []).length;
	}

	res.json({ data });
});
