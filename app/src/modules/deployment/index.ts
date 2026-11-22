import { defineModule } from '../defineModule.js';
import { useDeploymentNavigation } from '@directus/composables';
import DeploymentOverview from './routes/overview.vue';
import DeploymentProviderDashboard from './routes/provider/dashboard.vue';
import DeploymentProviderRun from './routes/provider/run.vue';
import DeploymentProviderRuns from './routes/provider/runs.vue';
import DeploymentProviderSettings from './routes/provider/settings.vue';

async function ensureNavLoaded() {
	await useDeploymentNavigation().fetch();
}

export default defineModule({
	id: 'deployment',
	name: 'Deployment',
	icon: 'rocket_launch',
	routes: [
		{
			name: 'deployments-overview',
			path: '',
			component: DeploymentOverview,
			beforeEnter: ensureNavLoaded,
		},
		{
			name: 'deployments-provider-dashboard',
			path: ':provider',
			component: DeploymentProviderDashboard,
			props: true,
			beforeEnter: ensureNavLoaded,
		},
		{
			name: 'deployments-provider-runs',
			path: ':provider/runs',
			component: DeploymentProviderRuns,
			props: true,
			beforeEnter: ensureNavLoaded,
		},
		{
			name: 'deployments-provider-run',
			path: ':provider/runs/:run',
			component: DeploymentProviderRun,
			props: true,
			beforeEnter: ensureNavLoaded,
		},
		{
			name: 'deployments-provider-settings',
			path: ':provider/settings',
			component: DeploymentProviderSettings,
			props: true,
			beforeEnter: ensureNavLoaded,
		},
	],
});
