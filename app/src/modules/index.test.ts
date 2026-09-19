import { describe, expect, it } from 'vitest';
import { getInternalModules } from './index.js';

describe('getInternalModules', () => {
	it('discovers the activity module with its real field values', () => {
		const modules = getInternalModules();

		expect(modules).toHaveLength(1);
		expect(modules[0]?.id).toBe('activity');
		expect(modules[0]?.name).toBe('Activity');
		expect(modules[0]?.icon).toBe('notifications');
		expect(modules[0]?.hidden).toBe(true);
	});
});
