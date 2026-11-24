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

	it('defines two routes: collection browser and item detail', () => {
		expect(ItemsModule.routes).toHaveLength(2);

		// Collection browser
		const browserRoute = ItemsModule.routes.find((r) => r.name === 'index')!;
		expect(browserRoute.path).toBe('');
		expect(browserRoute.component).toBe(ItemBrowser);

		// Item detail
		const detailRoute = ItemsModule.routes.find((r) => r.name === 'detail')!;
		expect(detailRoute.path).toBe(':id');
		expect(detailRoute.component).toBe(ItemDetail);
	});
});
