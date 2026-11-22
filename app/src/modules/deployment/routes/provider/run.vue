<script setup lang="ts">
import { ref } from 'vue';

const build = ref({
	id: '1',
	status: 'success',
	startedAt: '2026-11-20T10:30:00Z',
	duration: '2m 15s',
	commit: 'a1b2c3d',
	message: 'Fix auth helper tests',
	changes: [
		{ file: 'app/src/views/LoginPage.vue', change: 'added logoutReason prop' },
		{ file: 'app/src/router.ts', change: 'pass session_expired reason' },
		{ file: 'packages/errors/src/errors/unauthorized.ts', change: 'added UnauthorizedError' },
	],
});
</script>

<template>
	<div class="provider-run">
		<h1>Build Details</h1>
		<div class="build-header">
			<div class="build-id">Build {{ build.id }}</div>
			<div class="build-status" :class="`status--${build.status}`">{{ build.status }}</div>
		</div>
		<div class="build-details">
			<div class="build-commit">{{ build.commit }}</div>
			<div class="build-message">{{ build.message }}</div>
			<div class="build-time">{{ build.startedAt }}</div>
			<div class="build-duration">{{ build.duration }}</div>
		</div>
		<div class="build-changes">
			<h2>Changes</h2>
			<ul v-if="build.changes.length > 0" class="changes-list">
				<li v-for="change in build.changes" :key="change.file" class="change-item">
					<strong>{{ change.file }}</strong
					>: {{ change.change }}
				</li>
			</ul>
			<p v-else class="empty">No changes tracked.</p>
		</div>
	</div>
</template>

<style scoped>
.provider-run {
	padding: 2rem;
}

.build-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-block-end: 2rem;
}

.build-id {
	font-weight: 600;
	font-size: 1.25rem;
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
	margin-block-end: 2rem;
}

.build-commit {
	font-family: monospace;
	font-size: 0.875rem;
	color: var(--ink-soft);
	margin-block-end: 0.5rem;
}

.build-message {
	margin-block-end: 0.5rem;
}

.build-time,
.build-duration {
	color: var(--ink-soft);
	margin-block-end: 0.5rem;
}

.build-changes {
	border-block-start: 1px solid var(--rule);
	padding-block-start: 1rem;
}

.changes-list {
	list-style: none;
	padding: 0;
}

.change-item {
	padding: 0.75rem;
	border: 1px solid var(--paper-2);
	border-radius: 0.375rem;
	margin-block-end: 0.5rem;
}

.change-item strong {
	color: var(--ink);
}
</style>
