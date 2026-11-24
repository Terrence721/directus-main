import { describe, expect, it } from 'vitest';
import FilesModule from './index.js';
import FilesView from './routes/collection.vue';

describe('Files Module', () => {
	it('exports a module with correct properties', () => {
		expect(FilesModule.id).toBe('files');
		expect(FilesModule.name).toBe('Files');
		expect(FilesModule.icon).toBe('▲');
	});

	it('defines a single route to the collection view', () => {
		expect(FilesModule.routes).toHaveLength(1);
		expect(FilesModule.routes[0].name).toBe('index');
		expect(FilesModule.routes[0].path).toBe('');
		expect(FilesModule.routes[0].component).toBe(FilesView);
	});
});
