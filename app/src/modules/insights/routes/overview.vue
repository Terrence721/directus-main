<script setup lang="ts">
import { useInsightsStore } from '@directus/stores';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

const insightsStore = useInsightsStore();
const router = useRouter();

interface Dashboard {
	id: string;
	name: string;
	description?: string;
}

const dashboards = ref<Dashboard[]>([]);
const loading = ref(true);

onMounted(() => {
	insightsStore.hydrate().then(() => {
		dashboards.value = insightsStore.dashboards as unknown as Dashboard[];
		loading.value = false;
	});
});

function createDashboard() {
	router.push({ name: 'insights-dashboard', params: { primaryKey: 'new' } });
}

function editDashboard(id: string) {
	router.push({ name: 'insights-dashboard', params: { primaryKey: id } });
}
</script>

<template>
	<div class="insights-overview">
		<h1>Insights</h1>
		<button class="btn btn--primary" @click="createDashboard">Create Dashboard</button>

		<div v-if="loading" class="loading">Loading dashboards...</div>
		<div v-else-if="dashboards.length === 0" class="empty">No dashboards yet. Create your first one above.</div>
		<div v-else class="dashboard-list">
			<div
				v-for="dashboard in dashboards"
				:key="dashboard.id"
				class="dashboard-item"
				@click="editDashboard(dashboard.id)"
			>
				<div class="dashboard-name">{{ dashboard.name }}</div>
				<div class="dashboard-description">{{ dashboard.description || 'No description' }}</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.insights-overview {
	padding: 2rem;
}

.btn {
	padding: 0.75rem 1.5rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	font-weight: 600;
	cursor: pointer;
	margin-block-end: 1.5rem;
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

.dashboard-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 1.5rem;
}

.dashboard-item {
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1.5rem;
	cursor: pointer;
	transition: all 0.15s;
}

.dashboard-item:hover {
	background: var(--paper);
	border-color: var(--accent);
	transform: translateY(-2px);
}

.dashboard-name {
	font-weight: 600;
	margin-block-end: 0.5rem;
}

.dashboard-description {
	font-size: 0.875rem;
	color: var(--ink-soft);
}
</style>
