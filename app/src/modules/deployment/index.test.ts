import { describe, expect, it } from 'vitest';
import DeploymentModule from './index.js';
import DeploymentOverview from './routes/overview.vue';
import DeploymentProviderDashboard from './routes/provider/dashboard.vue';
import DeploymentProviderRun from './routes/provider/run.vue';
import DeploymentProviderRuns from './routes/provider/runs.vue';
import DeploymentProviderSettings from './routes/provider/settings.vue';

describe('Deployment Module', () => {
	it('exports a module with correct properties', () => {
		expect(DeploymentModule.id).toBe('deployment');
		expect(DeploymentModule.name).toBe('Deployment');
		expect(DeploymentModule.icon).toBe('rocket_launch');
	});

	it('defines all expected routes', () => {
		const expectedRoutes = [
			'deployments-overview',
			'deployments-provider-dashboard',
			'deployments-provider-runs',
			'deployments-provider-run',
			'deployments-provider-settings',
		];

		expect(DeploymentModule.routes).toHaveLength(5);
		DeploymentModule.routes.forEach((route, i) => {
			expect(route.name).toBe(expectedRoutes[i]);
			expect(typeof route.beforeEnter).toBe('function');
		});
	});

	it('points overview route to DeploymentOverview component', () => {
		const overviewRoute = DeploymentModule.routes.find((r) => r.name === 'deployments-overview')!;
		expect(overviewRoute.component).toBe(DeploymentOverview);
		expect(overviewRoute.path).toBe('');
	});

	it('points provider dashboard route to Dashboard component with dynamic path and props', () => {
		const dashboardRoute = DeploymentModule.routes.find((r) => r.name === 'deployments-provider-dashboard')!;
		expect(dashboardRoute.component).toBe(DeploymentProviderDashboard);
		expect(dashboardRoute.path).toBe(':provider');
		expect(dashboardRoute.props).toBe(true);
	});

	it('points runs route to Runs component with dynamic path and props', () => {
		const runsRoute = DeploymentModule.routes.find((r) => r.name === 'deployments-provider-runs')!;
		expect(runsRoute.component).toBe(DeploymentProviderRuns);
		expect(runsRoute.path).toBe(':provider/runs');
		expect(runsRoute.props).toBe(true);
	});

	it('points run route to Run component with dynamic path and props', () => {
		const runRoute = DeploymentModule.routes.find((r) => r.name === 'deployments-provider-run')!;
		expect(runRoute.component).toBe(DeploymentProviderRun);
		expect(runRoute.path).toBe(':provider/runs/:run');
		expect(runRoute.props).toBe(true);
	});

	it('points settings route to Settings component with dynamic path and props', () => {
		const settingsRoute = DeploymentModule.routes.find((r) => r.name === 'deployments-provider-settings')!;
		expect(settingsRoute.component).toBe(DeploymentProviderSettings);
		expect(settingsRoute.path).toBe(':provider/settings');
		expect(settingsRoute.props).toBe(true);
	});

	it('passes ensureNavLoaded as beforeEnter for all routes', () => {
		DeploymentModule.routes.forEach((route) => {
			expect(typeof route.beforeEnter).toBe('function');
		});
	});
});
