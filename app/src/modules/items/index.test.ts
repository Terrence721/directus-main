import { describe, expect, it } from 'vitest';
import ItemsModule from './index.js';
import ItemsCollection from './routes/collection.vue';
import ItemsDetail from './routes/detail.vue';

describe('Items Module', () => {
	it('exports a module with correct properties', () => {
		expect(ItemsModule.id).toBe('items');
		expect(ItemsModule.name).toBe('Items');
		expect(ItemsModule.icon).toBe('layers');
	});

	it('defines all expected routes', () => {
		const expectedRoutes = ['items-collection', 'items-detail'];

		expect(ItemsModule.routes).toHaveLength(2);
		ItemsModule.routes.forEach((route, i) => {
			expect(route.name).toBe(expectedRoutes[i]);
		});
	});

	it('points collection route to Collection component', () => {
		const collectionRoute = ItemsModule.routes.find((r) => r.name === 'items-collection')!;
		expect(collectionRoute.component).toBe(ItemsCollection);
		expect(collectionRoute.path).toBe('');
	});

	it('points detail route to Detail component with dynamic path and props', () => {
		const detailRoute = ItemsModule.routes.find((r) => r.name === 'items-detail')!;
		expect(detailRoute.component).toBe(ItemsDetail);
		expect(detailRoute.path).toBe(':collection/:id');
		expect(detailRoute.props).toBe(true);
	});
});
