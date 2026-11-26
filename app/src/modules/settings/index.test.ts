import { describe, expect, it } from 'vitest';
import SettingsModule from './index.js';
import SettingsPage from './routes/collection.vue';

describe('Settings Module', () => {
	it('exports a module with correct properties', () => {
		expect(SettingsModule.id).toBe('settings');
		expect(SettingsModule.name).toBe('Settings');
		expect(SettingsModule.icon).toBe('⚙');
	});

	it('defines a single route to the settings view', () => {
		expect(SettingsModule.routes).toHaveLength(1);
		expect(SettingsModule.routes[0].name).toBe('index');
		expect(SettingsModule.routes[0].path).toBe('');
		expect(SettingsModule.routes[0].component).toBe(SettingsPage);
	});
});
