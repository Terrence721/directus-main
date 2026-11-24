import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityModule from './index.js';
import ActivityCollection from './routes/collection.vue';

// Mock the ActivityCollection component
vi.mock('./routes/collection.vue', () => ({
	default: {
		name: 'ActivityCollection',
		template: '<div>Activity Collection Mock</div>',
	},
}));

describe('Activity Module', () => {
	it('exports a module with correct properties', () => {
		expect(ActivityModule.id).toBe('activity');
		expect(ActivityModule.hidden).toBe(true);
		expect(ActivityModule.name).toBe('Activity');
		expect(ActivityModule.icon).toBe('notifications');
	});

	it('defines a single route to the collection view', () => {
		expect(ActivityModule.routes).toHaveLength(1);
		expect(ActivityModule.routes[0].name).toBe('activity-collection');
		expect(ActivityModule.routes[0].path).toBe('');
		expect(ActivityModule.routes[0].component).toBe(ActivityCollection);
	});

	it('mounts the module without errors', () => {
		const wrapper = mount(ActivityModule.routes[0].component);
		expect(wrapper.exists()).toBe(true);
		expect(wrapper.text()).toContain('Activity Collection Mock');
	});
});
