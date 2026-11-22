<script setup lang="ts">
import { useInsightsStore } from '@directus/stores';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Dashboard, Panel } from '@directus/stores';

const store = useInsightsStore();
const route = useRoute();
const router = useRouter();

const dashboardId = route.params.primaryKey as string;

const dashboard = ref<Dashboard | null>(null);
const panels = ref<Panel[]>([]);
const loading = ref(true);

const dashboardDescription = computed({
	get() {
		return dashboard.value?.description || '';
	},
	set(value: string) {
		if (dashboard.value) {
			dashboard.value.description = value;
		}
	},
});

onMounted(async () => {
	if (dashboardId === 'new') {
		dashboard.value = {
			id: 'new',
			name: 'New Dashboard',
			description: '',
			panels: [],
		};
		loading.value = false;
		return;
	}

	try {
		await store.refresh(dashboardId);
		const found = store.dashboards.value.find((d: Dashboard) => d.id === dashboardId);
		if (found) {
			dashboard.value = {
				id: found.id,
				name: found.name,
				description: found.description || '',
				panels: found.panels.map((p: Panel) => ({
					id: p.id,
					name: p.name,
					type: p.type,
					config: p.config || {},
				})),
			};
			panels.value = found.panels.map((p: Panel) => ({
				id: p.id,
				name: p.name,
				type: p.type,
				config: p.config || {},
			}));
		}
	} catch (e) {
		console.error('Failed to load dashboard:', e);
	} finally {
		loading.value = false;
	}
});

function saveDashboard() {
	if (!dashboard.value) return;

	if (dashboardId === 'new') {
		store.addDashboard(dashboard.value as Dashboard);
		router.push({ name: 'insights-overview' });
	} else {
		store.updateDashboard(dashboard.value as Dashboard);
	}
}

function addPanel() {
	if (dashboard.value) {
		router.push({
			name: 'panel-detail',
			params: { primaryKey: dashboardId, panelKey: 'new' },
		});
	}
}
</script>

<template>
	<div class="insights-dashboard">
		<div class="header">
			<h1>{{ dashboard?.name || 'New Dashboard' }}</h1>
			<button class="btn btn--primary" @click="saveDashboard">
				{{ dashboardId === 'new' ? 'Create' : 'Save' }}
			</button>
		</div>

		<div v-if="loading" class="loading">Loading dashboard...</div>
		<div v-else class="content">
			<textarea v-model="dashboardDescription" class="description" placeholder="Dashboard description"></textarea>

			<div class="panels">
				<h2>Panels</h2>
				<button class="btn" @click="addPanel">Add Panel</button>

				<div v-if="panels.length === 0" class="empty">No panels yet. Add your first panel.</div>
				<div v-else class="panel-list">
					<div v-for="panel in panels" :key="panel.id" class="panel-item">
						<div class="panel-name">{{ panel.name }}</div>
						<div class="panel-type">{{ panel.type }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.insights-dashboard {
	padding: 2rem;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-block-end: 2rem;
}

.btn {
	padding: 0.75rem 1.5rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	font-weight: 600;
	cursor: pointer;
}

.btn:hover {
	background: var(--accent-hover);
}

.loading,
.empty {
	text-align: center;
	padding: 3rem;
	color: var(--ink-soft);
}

.content {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1.5rem;
}

.description {
	inline-size: 100%;
	padding: 1rem;
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	font-family: inherit;
	resize: vertical;
	min-block-size: 100px;
	margin-block-end: 1.5rem;
}

.panel-list {
	border-block-start: 1px solid var(--rule);
	padding-block-start: 1rem;
}

.panel-item {
	padding: 1rem;
	border: 1px solid var(--paper-2);
	border-radius: 0.375rem;
	margin-block-end: 0.5rem;
}

.panel-name {
	font-weight: 600;
}

.panel-type {
	font-size: 0.875rem;
	color: var(--ink-soft);
}
</style>
