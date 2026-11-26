import { describe, expect, it } from 'vitest';
import VisualModule from './index.js';
import CollectionBrowser from './routes/collection.vue';
import ItemDetail from './routes/detail.vue';

describe('Visual Module', () => {
	it('exports a module with correct properties', () => {
		expect(VisualModule.id).toBe('visual');
		expect(VisualModule.name).toBe('Visual');
		expect(VisualModule.icon).toBe('visual');
	});

	it('defines a route to the collection view', () => {
		expect(VisualModule.routes[0].name).toBe('index');
		expect(VisualModule.routes[0].path).toBe('');
		expect(VisualModule.routes[0].component).toBe(CollectionBrowser);
	});

	it('defines a route to the item detail view', () => {
		expect(VisualModule.routes).toHaveLength(2);
		expect(VisualModule.routes[1].name).toBe('item');
		expect(VisualModule.routes[1].path).toBe(':collection/:id');
		expect(VisualModule.routes[1].component).toBe(ItemDetail);
	});
});
