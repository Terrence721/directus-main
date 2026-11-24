import { describe, expect, it } from 'vitest';
import InsightsModule from './index.js';
import InsightsOverview from './routes/overview.vue';
import InsightsDashboard from './routes/dashboard.vue';
import InsightsPanelConfiguration from './routes/panel-configuration.vue';

describe('Insights Module', () => {
	it('exports a module with correct properties', () => {
		expect(InsightsModule.id).toBe('insights');
		expect(InsightsModule.name).toBe('Insights');
		expect(InsightsModule.icon).toBe('insights');
	});

	it('defines all expected routes', () => {
		const expectedRoutes = ['insights-overview', 'insights-dashboard'];

		expect(InsightsModule.routes).toHaveLength(2);
		InsightsModule.routes.forEach((route, i) => {
			expect(route.name).toBe(expectedRoutes[i]);
		});
	});

	it('points overview route to InsightsOverview component', () => {
		const overviewRoute = InsightsModule.routes.find((r) => r.name === 'insights-overview')!;
		expect(overviewRoute.component).toBe(InsightsOverview);
		expect(overviewRoute.path).toBe('');
	});

	it('points dashboard route to Dashboard component with dynamic path and props', () => {
		const dashboardRoute = InsightsModule.routes.find((r) => r.name === 'insights-dashboard')!;
		expect(dashboardRoute.component).toBe(InsightsDashboard);
		expect(dashboardRoute.path).toBe(':primaryKey');
		expect(dashboardRoute.props).toBe(true);
		expect(typeof dashboardRoute.beforeEnter).toBe('function');
	});

	it('includes panel configuration as child route', () => {
		const dashboardRoute = InsightsModule.routes.find((r) => r.name === 'insights-dashboard')!;
		expect(dashboardRoute.children).toHaveLength(1);
		expect(dashboardRoute.children![0].name).toBe('panel-detail');
		expect(dashboardRoute.children![0].component).toBe(InsightsPanelConfiguration);
		expect(dashboardRoute.children![0].path).toBe(':panelKey');
		expect(dashboardRoute.children![0].props).toBe(true);
	});
});
