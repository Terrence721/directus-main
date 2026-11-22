<script setup lang="ts">
import { useInsightsStore } from '@directus/stores';
import { onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Panel } from '@directus/stores';

const store = useInsightsStore();
const route = useRoute();
const router = useRouter();

const dashboardId = route.params.primaryKey as string;
const panelId = route.params.panelKey as string;

const panel = ref<Panel | null>(null);
const loading = ref(true);

const panelName = computed({
	get() {
		return panel.value?.name || '';
	},
	set(value: string) {
		if (panel.value) {
			panel.value.name = value;
		}
	},
});

const panelType = computed({
	get() {
		return panel.value?.type || 'chart';
	},
	set(value: string) {
		if (panel.value) {
			panel.value.type = value;
		}
	},
});

const panelConfig = computed({
	get() {
		return panel.value?.config ? JSON.stringify(panel.value.config, null, 2) : '';
	},
	set(value: string) {
		if (panel.value) {
			try {
				panel.value.config = JSON.parse(value);
			} catch {
				panel.value.config = {};
			}
		}
	},
});

onMounted(async () => {
	if (panelId === 'new') {
		panel.value = {
			id: 'new',
			name: 'New Panel',
			type: 'chart',
			config: {},
		};
		loading.value = false;
		return;
	}

	try {
		const dashboard = store.dashboards.value.find((d) => d.id === dashboardId);
		if (dashboard) {
			panel.value = dashboard.panels.find((p) => p.id === panelId) ?? null;
		}
	} catch (e) {
		console.error('Failed to load panel:', e);
	} finally {
		loading.value = false;
	}
});

function savePanel() {
	if (!panel.value || !dashboardId) return;

	if (panelId === 'new') {
		store.addPanel(dashboardId, panel.value as Panel);
	} else {
		store.updatePanel(dashboardId, panel.value as Panel);
	}

	router.push({ name: 'insights-dashboard', params: { primaryKey: dashboardId } });
}
</script>

<template>
	<div class="panel-configuration">
		<div class="header">
			<h1>{{ panel?.name || 'New Panel' }}</h1>
			<button class="btn btn--primary" @click="savePanel">{{ panelId === 'new' ? 'Create' : 'Save' }}</button>
		</div>

		<div v-if="loading" class="loading">Loading panel...</div>
		<div v-else class="form">
			<div class="form-group">
				<label>Panel Name</label>
				<input v-model="panelName" class="input" placeholder="Enter panel name" />
			</div>

			<div class="form-group">
				<label>Panel Type</label>
				<select v-model="panelType" class="select">
					<option value="chart">Chart</option>
					<option value="table">Table</option>
					<option value="metric">Metric</option>
					<option value="calendar">Calendar</option>
					<option value="map">Map</option>
				</select>
			</div>

			<div class="form-group">
				<label>Configuration</label>
				<textarea v-model="panelConfig" class="config" placeholder="JSON configuration"></textarea>
			</div>
		</div>
	</div>
</template>

<style scoped>
.panel-configuration {
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

.form {
	max-inline-size: 800px;
	margin: 0 auto;
}

.form-group {
	margin-block-end: 1.5rem;
}

.label {
	display: block;
	margin-block-end: 0.5rem;
	font-weight: 600;
}

.input,
.select,
.config {
	inline-size: 100%;
	padding: 0.75rem;
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	font-family: inherit;
}

.input,
.config {
	resize: vertical;
}

.config {
	min-block-size: 150px;
}

.select {
	min-block-size: 40px;
}
</style>
