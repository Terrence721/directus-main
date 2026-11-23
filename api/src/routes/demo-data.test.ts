import { describe, expect, it } from 'vitest';
import { DEMO_EMAIL, DEMO_PASSWORD, ITEMS, USERS, getCurrentUserById } from './demo-data.js';

describe('demo-data constants', () => {
	it('exposes the demo email and password used by the seeded account', () => {
		expect(DEMO_EMAIL).toBe('demo@directus-main.dev');
		expect(DEMO_PASSWORD).toBe('demo1234');
	});
});

describe('USERS', () => {
	it('contains exactly one fully-formed demo user', () => {
		expect(USERS).toHaveLength(1);

		const [user] = USERS;

		expect(user).toMatchObject({
			email: DEMO_EMAIL,
			password: DEMO_PASSWORD,
			id: 'user-001',
			firstName: 'Demo',
			lastName: 'User',
		});
	});

	it('stores a null avatar url rather than undefined', () => {
		expect(USERS[0].avatarUrl).toBeNull();
	});
});

describe('ITEMS', () => {
	it('seeds the demo_items collection with three rows', () => {
		expect(ITEMS['demo_items']).toHaveLength(3);
	});

	it('seeds the demo_pages collection with three rows', () => {
		expect(ITEMS['demo_pages']).toHaveLength(3);
	});

	it('gives every item an id matching String(row.id) semantics', () => {
		for (const rows of Object.values(ITEMS)) {
			for (const row of rows) {
				expect(typeof row.id).toBe('string');
				expect(row.id.length).toBeGreaterThan(0);
			}
		}
	});

	it('tags every item with its owning collection name', () => {
		for (const [collectionName, rows] of Object.entries(ITEMS)) {
			for (const row of rows) {
				expect(row.collection).toBe(collectionName);
			}
		}
	});

	it('uses only published/draft statuses', () => {
		for (const rows of Object.values(ITEMS)) {
			for (const row of rows) {
				expect(['published', 'draft']).toContain(row.status);
			}
		}
	});

	it('mixes published and draft rows so filters are exercised', () => {
		const statuses = ITEMS['demo_items'].map((row) => row.status);

		expect(statuses).toContain('published');
		expect(statuses).toContain('draft');
	});

	it('carries a content field on demo_pages rows', () => {
		for (const row of ITEMS['demo_pages']) {
			expect(typeof row['content']).toBe('string');
		}
	});
});

describe('getCurrentUserById', () => {
	it('returns the demo user for the seeded id', () => {
		const user = getCurrentUserById('user-001');

		expect(user).toBeDefined();
		expect(user?.email).toBe(DEMO_EMAIL);
	});

	it('returns undefined for an unknown id', () => {
		expect(getCurrentUserById('user-999')).toBeUndefined();
	});

	it('returns undefined for an empty string', () => {
		expect(getCurrentUserById('')).toBeUndefined();
	});
});
