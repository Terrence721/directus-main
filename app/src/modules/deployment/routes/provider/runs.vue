<script setup lang="ts">
import { ref } from 'vue';

const builds = ref([
	{
		id: '1',
		status: 'success',
		startedAt: '2026-11-20T10:30:00Z',
		duration: '2m 15s',
		commit: 'a1b2c3d',
		message: 'Fix auth helper tests',
	},
	{
		id: '2',
		status: 'failed',
		startedAt: '2026-11-20T09:15:00Z',
		duration: '1m 45s',
		commit: 'e4f5g6h',
		message: 'Add dashboard feature',
	},
]);
</script>

<template>
	<div class="provider-runs">
		<h1>Deployment Runs</h1>
		<div v-if="builds.length === 0" class="empty">No builds yet.</div>
		<div v-else class="runs-list">
			<div v-for="build in builds" :key="build.id" class="build-item" :class="`build--${build.status}`">
				<div class="build-header">
					<span class="build-id">{{ build.id }}</span>
					<span class="build-status" :class="`status--${build.status}`">{{ build.status }}</span>
				</div>
				<div class="build-details">
					<div class="build-commit">{{ build.commit }}</div>
					<div class="build-message">{{ build.message }}</div>
				</div>
				<div class="build-meta">
					<div class="build-time">{{ build.startedAt }}</div>
					<div class="build-duration">{{ build.duration }}</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.provider-runs {
	padding: 2rem;
}

.build-item {
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1.5rem;
	margin-block-end: 1rem;
}

.build-item.build--success {
	border-inline-start: 4px solid var(--success);
}

.build-item.build--failed {
	border-inline-start: 4px solid var(--error);
}

.build-header {
	display: flex;
	justify-content: space-between;
	margin-block-end: 1rem;
}

.build-id {
	font-weight: 600;
}

.build-status {
	padding: 0.25rem 0.75rem;
	border-radius: 0.25rem;
	font-size: 0.875rem;
	font-weight: 500;
}

.status--success {
	background: var(--success-2);
	color: var(--success-ink);
}

.status--failed {
	background: var(--error-2);
	color: var(--error-ink);
}

.build-details {
	margin-block-end: 1rem;
}

.build-commit {
	font-family: monospace;
	font-size: 0.875rem;
	color: var(--ink-soft);
}

.build-message {
	margin-block-start: 0.5rem;
}

.build-meta {
	display: flex;
	gap: 2rem;
	font-size: 0.875rem;
	color: var(--ink-soft);
}
</style>
