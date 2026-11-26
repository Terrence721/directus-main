import { describe, expect, it } from 'vitest';
import ContentModule from './index.js';
import CollectionBrowser from './routes/collection.vue';
import ItemDetail from './routes/detail.vue';

describe('Content Module', () => {
	it('exports a module with correct properties', () => {
		expect(ContentModule.id).toBe('content');
		expect(ContentModule.name).toBe('Content');
		expect(ContentModule.icon).toBe('box');
	});

	it('defines a route to the collection view', () => {
		expect(ContentModule.routes[0].name).toBe('index');
		expect(ContentModule.routes[0].path).toBe('');
		expect(ContentModule.routes[0].component).toBe(CollectionBrowser);
	});

	it('defines a route to the item detail view', () => {
		expect(ContentModule.routes).toHaveLength(2);
		expect(ContentModule.routes[1].name).toBe('item');
		expect(ContentModule.routes[1].path).toBe(':collection/:id');
		expect(ContentModule.routes[1].component).toBe(ItemDetail);
	});
});
