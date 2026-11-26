import { describe, expect, it } from 'vitest';
import SearchModule from './index.js';
import SearchView from './routes/collection.vue';

describe('Search Module', () => {
	it('exports a module with correct properties', () => {
		expect(SearchModule.id).toBe('search');
		expect(SearchModule.name).toBe('Search');
		expect(SearchModule.icon).toBe('⌕');
	});

	it('defines a single route to the search view', () => {
		expect(SearchModule.routes).toHaveLength(1);
		expect(SearchModule.routes[0].name).toBe('index');
		expect(SearchModule.routes[0].path).toBe('');
		expect(SearchModule.routes[0].component).toBe(SearchView);
	});
});
