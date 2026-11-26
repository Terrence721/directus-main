/**
 * In-memory stand-in for api/, used by the deployed GitHub Pages demo where there is no
 * backend at all. api/ only ever runs on a developer's own machine, so a visitor to the
 * published app can reach none of it - without this, every list/detail page fails with a
 * network error the moment the visitor logs in.
 *
 * Routes and payloads mirror api/src/routes/* (items, collections, users, files, activity,
 * search) closely enough that the same composables and views work unchanged against both.
 * State is per-page-load and resets on refresh, which is fine for a demo.
 */

export interface SimulatedResponse {
	ok: boolean;
	status: number;
	json: () => Promise<unknown>;
}

interface DemoUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	avatarUrl: string | null;
}

interface DemoFile {
	id: string;
	filename: string;
	collection: string | null;
	mimeType: string;
	createdAt: number;
}

interface DemoActivity {
	id: string;
	action: string;
	collection: string | null;
	recordId: string | null;
	userEmail: string;
	createdAt: number;
}

const DEMO_USER: DemoUser = {
	id: 'user-001',
	email: 'demo@directus-main.dev',
	firstName: 'Demo',
	lastName: 'User',
	avatarUrl: null,
};

const COLLECTIONS = [
	{
		collection: 'demo_items',
		label: 'Demo Items',
		fields: [
			{ name: 'id', type: 'string' },
			{ name: 'title', type: 'string' },
			{ name: 'status', type: 'string' },
		],
	},
	{
		collection: 'demo_pages',
		label: 'Pages',
		fields: [
			{ name: 'id', type: 'string' },
			{ name: 'title', type: 'string' },
			{ name: 'status', type: 'string' },
			{ name: 'content', type: 'string' },
		],
	},
];

const items: Record<string, Array<Record<string, unknown>>> = {
	demo_items: [
		{ id: '1', collection: 'demo_items', title: 'First item', status: 'published' },
		{ id: '2', collection: 'demo_items', title: 'Second item', status: 'draft' },
		{ id: '3', collection: 'demo_items', title: 'Third item', status: 'published' },
	],
	demo_pages: [
		{ id: 'p1', collection: 'demo_pages', title: 'Home Page', status: 'published', content: 'Welcome to our site.' },
		{ id: 'p2', collection: 'demo_pages', title: 'About Us', status: 'draft', content: 'Learn more about us.' },
		{ id: 'p3', collection: 'demo_pages', title: 'Contact', status: 'published', content: 'Get in touch with us.' },
	],
};

const users: DemoUser[] = [DEMO_USER];
const files: DemoFile[] = [];
const activity: DemoActivity[] = [];

function respond(status: number, body: unknown): SimulatedResponse {
	return { ok: status < 400, status, json: async () => body };
}

function error(status: number, code: string, message: string): SimulatedResponse {
	return respond(status, { code, message });
}

function paginate<T>(rows: T[], page: number, limit: number) {
	const start = (page - 1) * limit;
	return {
		page: rows.slice(start, start + limit),
		meta: { totalCount: rows.length, page, pageSize: limit, lastPage: Math.max(1, Math.ceil(rows.length / limit)) },
	};
}

/** Supports the two filter spellings the app uses: plain equality and `operator|value`. */
function applyItemFilters(
	rows: Array<Record<string, unknown>>,
	params: URLSearchParams,
): Array<Record<string, unknown>> {
	const reserved = new Set(['limit', 'page', 'sort', 'fields', 'q']);
	let result = rows;

	for (const [key, raw] of params.entries()) {
		if (reserved.has(key)) continue;
		const [maybeOperator, maybeValue] = raw.split('|');
		const hasOperator = maybeOperator?.startsWith('_');
		const operator = hasOperator ? maybeOperator : '_eq';
		const value = hasOperator ? (maybeValue ?? '') : raw;

		result = result.filter((row) => {
			const actual = row[key];
			switch (operator) {
				case '_icontains':
					return String(actual ?? '')
						.toLowerCase()
						.includes(value.toLowerCase());
				case '_contains':
					return String(actual ?? '').includes(value);
				case '_ne':
					return String(actual ?? '') !== value;
				case '_is_null':
					return actual === null || actual === undefined;
				case '_is_not_null':
					return actual !== null && actual !== undefined;
				default:
					return String(actual ?? '') === value;
			}
		});
	}

	return result;
}

function sortItems(rows: Array<Record<string, unknown>>, sort: string | null): Array<Record<string, unknown>> {
	if (!sort) return rows;
	const desc = sort.startsWith('-');
	const field = desc ? sort.slice(1) : sort;
	return [...rows].sort((a, b) => {
		const av = a[field];
		const bv = b[field];
		if (av === bv) return 0;
		if (av === null || av === undefined) return desc ? 1 : -1;
		if (bv === null || bv === undefined) return desc ? -1 : 1;
		return (av < bv ? -1 : 1) * (desc ? -1 : 1);
	});
}

/** Names the uploaded file without depending on a real backend having stored it. */
function uploadedFilename(body: BodyInit | null | undefined): string {
	const form = body instanceof FormData ? body : null;
	const file = form?.get('file');
	if (file && typeof file === 'object' && 'name' in file && typeof file.name === 'string') {
		return file.name;
	}
	if (form) {
		const named = form.get('filename');
		if (typeof named === 'string' && named) return named;
	}
	return `upload-${Date.now()}`;
}

export function handleSimulatedRequest(path: string, init: RequestInit = {}): SimulatedResponse {
	const url = new URL(path, 'http://simulated.local');
	const segments = url.pathname.split('/').filter(Boolean);
	const method = (init.method ?? 'GET').toUpperCase();
	const [root, second, third] = segments;
	const page = Number(url.searchParams.get('page') ?? 1) || 1;
	const limit = Math.min(Number(url.searchParams.get('limit') ?? 20) || 20, 100);

	if (root === 'collections') {
		if (!second) {
			return respond(200, {
				data: COLLECTIONS.map((c) => ({ ...c, sampleCount: (items[c.collection] ?? []).length })),
			});
		}
		const found = COLLECTIONS.find((c) => c.collection === second);
		if (!found) return error(404, 'NOT_FOUND', `Collection "${second}" not found.`);
		return respond(200, { data: found });
	}

	if (root === 'items' && second) {
		const rows = items[second];
		if (!rows) return error(404, 'NOT_FOUND', `Collection "${second}" not found.`);

		if (!third) {
			if (method === 'POST') {
				const body = (init.body ? JSON.parse(String(init.body)) : {}) as Record<string, unknown>;
				const created = {
					id: `item-${Date.now()}`,
					collection: second,
					title: String(body['title'] ?? `Item ${rows.length + 1}`),
					...body,
					status: body['status'] === 'published' ? 'published' : 'draft',
				};
				rows.push(created);
				return respond(201, { data: created });
			}

			const filtered = applyItemFilters(rows, url.searchParams);
			const sorted = sortItems(filtered, url.searchParams.get('sort'));
			const { page: pageRows, meta } = paginate(sorted, page, limit);
			return respond(200, { data: pageRows, meta });
		}

		const index = rows.findIndex((row) => String(row['id']) === third);
		if (index === -1) return error(404, 'NOT_FOUND', `Item "${third}" not found.`);

		if (method === 'PATCH') {
			const body = (init.body ? JSON.parse(String(init.body)) : {}) as Record<string, unknown>;
			rows[index] = { ...rows[index], ...body };
			return respond(200, { data: rows[index] });
		}
		if (method === 'DELETE') {
			rows.splice(index, 1);
			return respond(200, { data: { id: third } });
		}
		return respond(200, { data: rows[index] });
	}

	if (root === 'users') {
		if (second === 'me') {
			const current = users[0] ?? DEMO_USER;
			if (method === 'PATCH') {
				const body = (init.body ? JSON.parse(String(init.body)) : {}) as Partial<DemoUser>;
				Object.assign(current, {
					firstName: body.firstName ?? current.firstName,
					lastName: body.lastName ?? current.lastName,
					email: body.email ?? current.email,
				});
			}
			// api/ answers /users/me with `user`; the settings view reads `data`, so send both.
			return respond(200, { user: current, data: current });
		}
		const { page: pageUsers, meta } = paginate(users, page, limit);
		return respond(200, { data: pageUsers, meta });
	}

	if (root === 'files') {
		if (method === 'POST') {
			const record: DemoFile = {
				id: `file-${Date.now()}`,
				filename: uploadedFilename(init.body),
				collection: null,
				mimeType: 'application/octet-stream',
				createdAt: Date.now(),
			};
			files.unshift(record);
			return respond(201, { data: record });
		}
		return respond(200, { data: files, meta: { totalCount: files.length } });
	}

	if (root === 'assets') {
		const record: DemoFile = {
			id: `file-${Date.now()}`,
			filename: uploadedFilename(init.body),
			collection: null,
			mimeType: 'application/octet-stream',
			createdAt: Date.now(),
		};
		files.unshift(record);
		return respond(201, { data: record });
	}

	if (root === 'activity') {
		if (method === 'POST') {
			const body = (init.body ? JSON.parse(String(init.body)) : {}) as Record<string, unknown>;
			const entry: DemoActivity = {
				id: `act-${Date.now()}`,
				action: String(body['action'] ?? 'unknown'),
				collection: (body['collection'] as string | undefined) ?? null,
				recordId: (body['recordId'] as string | undefined) ?? null,
				userEmail: users[0]?.email ?? DEMO_USER.email,
				createdAt: Date.now(),
			};
			activity.unshift(entry);
			return respond(201, { data: entry });
		}
		const { page: pageEntries, meta } = paginate(activity, page, limit);
		return respond(200, { data: pageEntries, meta });
	}

	if (root === 'search') {
		const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
		if (!q) return respond(200, { data: [], meta: { totalCount: 0 } });

		const selected = url.searchParams.getAll('collections[]');
		const hits: Array<Record<string, unknown>> = [];
		for (const [collectionName, rows] of Object.entries(items)) {
			if (selected.length > 0 && !selected.includes(collectionName)) continue;
			for (const row of rows) {
				const matches = Object.values(row).some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
				if (matches) hits.push({ collection: collectionName, ...row });
			}
		}
		const { page: pageHits, meta } = paginate(hits, page, limit);
		return respond(200, { data: pageHits, meta });
	}

	if (root === 'server' && second === 'info') {
		return respond(200, {
			projectName: 'Directus Main Demo',
			projectLogoUrl: null,
			projectColor: '#563acc',
			authProviders: [
				{ name: 'Email / Password', driver: 'local' },
				{ name: 'Google', driver: 'oauth2' },
				{ name: 'GitHub', driver: 'oauth2' },
			],
			registrationEnabled: true,
		});
	}

	return error(404, 'NOT_FOUND', `No simulated route for ${method} ${url.pathname}`);
}

/** Resets the in-memory store; tests use this to isolate cases. */
export function resetSimulatedApi(): void {
	users.length = 0;
	users.push({ ...DEMO_USER });
	files.length = 0;
	activity.length = 0;
	items['demo_items'] = [
		{ id: '1', collection: 'demo_items', title: 'First item', status: 'published' },
		{ id: '2', collection: 'demo_items', title: 'Second item', status: 'draft' },
		{ id: '3', collection: 'demo_items', title: 'Third item', status: 'published' },
	];
	items['demo_pages'] = [
		{ id: 'p1', collection: 'demo_pages', title: 'Home Page', status: 'published', content: 'Welcome to our site.' },
		{ id: 'p2', collection: 'demo_pages', title: 'About Us', status: 'draft', content: 'Learn more about us.' },
		{ id: 'p3', collection: 'demo_pages', title: 'Contact', status: 'published', content: 'Get in touch with us.' },
	];
}
