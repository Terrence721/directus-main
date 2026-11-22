import { ref } from 'vue';

export interface Dashboard {
	id: string;
	name: string;
	description?: string;
	panels: Panel[];
}

export interface Panel {
	id: string;
	name: string;
	type: string;
	config?: Record<string, unknown>;
}

const dashboards = ref<Dashboard[]>([]);

export function useInsightsStore() {
	async function hydrate(): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 300));
	}

	async function refresh(id: string): Promise<void> {
		await new Promise((resolve) => setTimeout(resolve, 200));
		const dashboard = dashboards.value.find((d) => d.id === id);
		if (dashboard) {
			await hydrate();
		}
	}

	function addDashboard(dashboard: Dashboard): void {
		dashboards.value.push(dashboard);
	}

	function updateDashboard(dashboard: Dashboard): void {
		const index = dashboards.value.findIndex((d) => d.id === dashboard.id);
		if (index !== -1) {
			dashboards.value[index] = dashboard;
		}
	}

	function addPanel(dashboardId: string, panel: Panel): void {
		const dashboard = dashboards.value.find((d) => d.id === dashboardId);
		if (dashboard) {
			dashboard.panels.push(panel);
		}
	}

	function updatePanel(dashboardId: string, panel: Panel): void {
		const dashboard = dashboards.value.find((d) => d.id === dashboardId);
		if (dashboard) {
			const index = dashboard.panels.findIndex((p) => p.id === panel.id);
			if (index !== -1) {
				dashboard.panels[index] = panel;
			}
		}
	}

	return {
		dashboards,
		hydrate,
		refresh,
		addDashboard,
		updateDashboard,
		addPanel,
		updatePanel,
	};
}
