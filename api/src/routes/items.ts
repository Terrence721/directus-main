import { NotFoundError } from '@directus/errors';
import { Router } from 'express';
import { ITEMS } from './demo-data.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const VALID_FILTER_OPERATORS = [
	'_eq',
	'_ne',
	'_gt',
	'_gte',
	'_lt',
	'_lte',
	'_like',
	'_ilike',
	'_in',
	'_nin',
	'_between',
	'_is_null',
	'_is_not_null',
];

function evaluateFilterFilter(itemValue: unknown, filterValue: string): boolean {
	if (filterValue === null || filterValue === undefined) return true;
	if (itemValue === null || itemValue === undefined) return false;

	// Handle operator-prefixed filters like filter[status][_eq]=published
	const filterParts = filterValue.split('|');
	const operator = filterParts[0];
	const value = filterParts.length > 1 ? filterParts[1] : filterValue;

	switch (operator) {
		case '_eq':
			return String(itemValue) === String(value);
		case '_ne':
			return String(itemValue) !== String(value);
		case '_gt':
			return Number(itemValue) > Number(value);
		case '_gte':
			return Number(itemValue) >= Number(value);
		case '_lt':
			return Number(itemValue) < Number(value);
		case '_lte':
			return Number(itemValue) <= Number(value);
		case '_like':
			return String(itemValue).includes(String(value));
		case '_ilike':
			return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
		case '_in':
			return (value || '').split(',').some((v: string) => String(itemValue) === String(v));
		case '_nin':
			return !(value || '').split(',').some((v: string) => String(itemValue) === String(v));
		case '_is_null':
			return itemValue === null;
		case '_is_not_null':
			return itemValue !== null;
		default:
			// Simple exact match for backward compatibility
			return String(itemValue) === String(filterValue);
	}
}

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
	const sort = (req.query.sort as string) || '';
	const fields = req.query.fields as string | string[] | undefined;

	// Parse fields: can be comma-separated string or array
	let fieldNames: string[] = [];
	if (fields) {
		if (Array.isArray(fields)) {
			fieldNames = fields as string[];
		} else {
			fieldNames = String(fields)
				.split(',')
				.map((f: string) => f.trim())
				.filter((f: string) => f);
		}
	}

	const filters = req.query;

	// Apply filters
	let filteredData = data;
	if (filters) {
		// Remove pagination and sort params from filters
		const filterKeys = Object.keys(filters).filter((key) => !['limit', 'page', 'sort'].includes(key));

		filteredData = filteredData.filter((item) => {
			return filterKeys.every((key) => {
				const filterValue = filters[key];
				// Check if filterValue has operator prefix (e.g., _eq, _like, _in)
				if (typeof filterValue === 'string' && VALID_FILTER_OPERATORS.some((op) => filterValue.startsWith(`_${op}`))) {
					// Deep filter with operator: filter[field][_operator]=value
					const fieldValue = (item as Record<string, unknown>)[key];
					return evaluateFilterFilter(fieldValue, filterValue);
				}
				// Simple exact match for backward compatibility
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

	const pageData = sortedData.slice(start, end);

	// Apply field selection
	const resultData =
		fieldNames.length > 0
			? pageData.map((item) => {
					const result: Record<string, unknown> = {};
					fieldNames.forEach((field) => {
						const value = (item as Record<string, unknown>)[field];
						if (value !== undefined) result[field] = value;
					});
					return result;
				})
			: pageData;

	res.json({
		data: resultData,
		meta: {
			totalCount: total,
			page,
			pageSize: limit,
			lastPage: Math.ceil(total / limit),
		},
	});
});

// ---------------------------------------------------------------------------
// POST /items/:collection — Create a new item
// ---------------------------------------------------------------------------

itemsRouter.post('/:collection', (req, res) => {
	const collection = req.params.collection;
	const data = ITEMS[collection];

	if (!data) {
		const error = new NotFoundError(`Collection "${collection}" not found.`);
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	// Simple object creation — just push into the array with a new ID
	const body = req.body as Record<string, unknown>;
	const newItem = {
		id: `item-${Date.now()}`,
		collection,
		title: String(body.title ?? `Item ${data.length + 1}`),
		...body,
		status: body.status === 'published' ? ('published' as const) : ('draft' as const),
	};

	data.push(newItem);

	res.status(201).json({ data: newItem });
});
