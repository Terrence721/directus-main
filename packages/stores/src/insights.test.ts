import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
	setActivePinia(createPinia());
	// Reset module-level state by re-importing the module
	vi.resetModules();
});

describe('useInsightsStore', () => {
	it('starts with empty dashboards', async () => {
		const { useInsightsStore } = await import('./insights.js');
		const store = useInsightsStore();

		expect(store.dashboards.value).toEqual([]);
	});

	describe('addDashboard', () => {
		it('adds a dashboard to the store', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({
				id: 'dash-1',
				name: 'Test Dashboard',
				description: 'A test dashboard',
				panels: [],
			});

			expect(store.dashboards.value).toHaveLength(1);
			expect(store.dashboards.value[0].id).toBe('dash-1');
			expect(store.dashboards.value[0].name).toBe('Test Dashboard');
		});

		it('adds multiple dashboards', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Dashboard 1', panels: [] });
			store.addDashboard({ id: 'dash-2', name: 'Dashboard 2', panels: [] });

			expect(store.dashboards.value).toHaveLength(2);
		});
	});

	describe('updateDashboard', () => {
		it('updates an existing dashboard', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Original', panels: [] });
			store.updateDashboard({ id: 'dash-1', name: 'Updated', panels: [] });

			expect(store.dashboards.value[0].name).toBe('Updated');
		});

		it('does nothing when dashboard does not exist', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Original', panels: [] });
			store.updateDashboard({ id: 'dash-999', name: 'Updated', panels: [] });

			expect(store.dashboards.value[0].name).toBe('Original');
			expect(store.dashboards.value).toHaveLength(1);
		});
	});

	describe('addPanel', () => {
		it('adds a panel to an existing dashboard', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Test', panels: [] });
			store.addPanel('dash-1', { id: 'panel-1', name: 'Panel 1', type: 'chart' });

			expect(store.dashboards.value[0].panels).toHaveLength(1);
			expect(store.dashboards.value[0].panels[0].id).toBe('panel-1');
		});

		it('does nothing when dashboard does not exist', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Test', panels: [] });
			store.addPanel('dash-999', { id: 'panel-1', name: 'Panel 1', type: 'chart' });

			expect(store.dashboards.value[0].panels).toHaveLength(0);
		});
	});

	describe('updatePanel', () => {
		it('updates an existing panel in a dashboard', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Test', panels: [] });
			store.addPanel('dash-1', { id: 'panel-1', name: 'Panel 1', type: 'chart' });
			store.updatePanel('dash-1', { id: 'panel-1', name: 'Updated Panel', type: 'chart' });

			expect(store.dashboards.value[0].panels[0].name).toBe('Updated Panel');
		});

		it('does nothing when dashboard does not exist', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Test', panels: [] });
			store.addPanel('dash-1', { id: 'panel-1', name: 'Panel 1', type: 'chart' });
			store.updatePanel('dash-999', { id: 'panel-1', name: 'Updated', type: 'chart' });

			expect(store.dashboards.value[0].panels[0].name).toBe('Panel 1');
		});

		it('does nothing when panel does not exist', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Test', panels: [] });
			store.addPanel('dash-1', { id: 'panel-1', name: 'Panel 1', type: 'chart' });
			store.updatePanel('dash-1', { id: 'panel-999', name: 'Updated', type: 'chart' });

			expect(store.dashboards.value[0].panels[0].name).toBe('Panel 1');
		});
	});

	describe('hydrate', () => {
		it('resolves after a delay', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			await expect(store.hydrate()).resolves.toBeUndefined();
		});
	});

	describe('refresh', () => {
		it('resolves after a delay for existing dashboard', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			store.addDashboard({ id: 'dash-1', name: 'Test', panels: [] });
			await expect(store.refresh('dash-1')).resolves.toBeUndefined();
		});

		it('resolves without error for non-existent dashboard', async () => {
			const { useInsightsStore } = await import('./insights.js');
			const store = useInsightsStore();

			await expect(store.refresh('dash-999')).resolves.toBeUndefined();
		});
	});
});
