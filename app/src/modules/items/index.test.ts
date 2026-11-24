import { describe, expect, it } from 'vitest';
import ItemsModule from './index.js';
import ItemBrowser from './routes/collection.vue';
import ItemDetail from './routes/detail.vue';

describe('Items Module', () => {
	it('exports a module with correct properties', () => {
		expect(ItemsModule.id).toBe('items');
		expect(ItemsModule.name).toBe('Items');
		expect(ItemsModule.icon).toBe('☰');
	});

	it('defines all expected routes', () => {
		const expectedRoutes = ['index', 'detail'];

		expect(ItemsModule.routes).toHaveLength(2);
		ItemsModule.routes.forEach((route, i) => {
			expect(route.name).toBe(expectedRoutes[i]);
		});
	});

	it('points collection route to Collection component', () => {
		const collectionRoute = ItemsModule.routes.find((r) => r.name === 'index')!;
		expect(collectionRoute.component).toBe(ItemBrowser);
		expect(collectionRoute.path).toBe('');
	});

	it('points detail route to Detail component with dynamic path', () => {
		const detailRoute = ItemsModule.routes.find((r) => r.name === 'detail')!;
		expect(detailRoute.component).toBe(ItemDetail);
		expect(detailRoute.path).toBe(':id');
	});
});
