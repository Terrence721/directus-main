import { describe, expect, it } from 'vitest';
import { getInternalModules } from './index.js';

describe('getInternalModules', () => {
	it('discovers all registered modules including activity', () => {
		const modules = getInternalModules();

		expect(modules.length).toBeGreaterThanOrEqual(4);
		const ids = modules.map((m) => m.id);
		expect(ids).toContain('activity');
		expect(ids).toContain('items');
		expect(ids).toContain('files');
		expect(ids).toContain('search');
	});

	it('marks the activity module as hidden', () => {
		const modules = getInternalModules();
		const activity = modules.find((m) => m.id === 'activity');
		expect(activity?.hidden).toBe(true);
	});

	it('preserves real field values of each discovered module', () => {
		const modules = getInternalModules();
		for (const mod of modules) {
			expect(mod.id).toBeTruthy();
			expect(mod.name).toBeTruthy();
			expect(mod.icon).toBeTruthy();
			expect(Array.isArray(mod.routes)).toBe(true);
		}
	});
});
