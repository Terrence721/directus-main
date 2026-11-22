<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, useActivity } from '@directus/composables';

const auth = useAuth();
const accessToken = ref(auth.session?.accessToken ?? null);

const { data: entries, loading, error, fetchActivity } = useActivity(accessToken.value);

onMounted(() => {
	if (accessToken.value) fetchActivity();
});
</script>

<template>
	<div class="activity-view">
		<h1>Activity</h1>

		<p v-if="loading" class="activity-loading">Loading…</p>
		<p v-else-if="error" class="activity-error">{{ error.message }}</p>

		<table v-else-if="entries.length > 0" class="activity-table">
			<thead>
				<tr>
					<th>Action</th>
					<th>Collection</th>
					<th>Record</th>
					<th>User</th>
					<th>Time</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="entry in entries" :key="entry.id">
					<td>
						<span class="action-badge" :class="`action-${entry.action}`">
							{{ entry.action }}
						</span>
					</td>
					<td>{{ entry.collection ?? '—' }}</td>
					<td>{{ entry.recordId ?? '—' }}</td>
					<td>{{ entry.userEmail }}</td>
					<td>{{ new Date(entry.createdAt).toLocaleString() }}</td>
				</tr>
			</tbody>
		</table>

		<p v-else class="activity-empty">No recent activity.</p>
	</div>
</template>

<style scoped>
.activity-view {
	max-inline-size: 900px;
}

.activity-view h1 {
	margin: 0 0 1.5rem;
	font-size: 1.5rem;
}

.activity-loading,
.activity-error,
.activity-empty {
	color: var(--ink-soft);
	font-size: 0.9375rem;
	padding: 2rem 0;
}

.activity-error {
	color: #b3261e;
}

.activity-table {
	inline-size: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.activity-table th,
.activity-table td {
	padding: 0.625rem 0.75rem;
	text-align: start;
	border-block-end: 1px solid var(--rule);
}

.activity-table th {
	font-weight: 600;
	color: var(--ink-soft);
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	background: var(--paper-2);
}

.activity-table tr:hover td {
	background: var(--paper-2);
}

.action-badge {
	display: inline-block;
	padding: 0.1875rem 0.5rem;
	border-radius: 0.25rem;
	font-size: 0.75rem;
	font-weight: 600;
	text-transform: capitalize;
}

.action-create {
	background: #dcfce7;
	color: #166534;
}

.action-update {
	background: #dbeafe;
	color: #1e40af;
}

.action-delete {
	background: #fee2e2;
	color: #991b1b;
}

.dark-mode .action-create,
[data-theme='dark'] .action-create {
	background: #166534;
	color: #dcfce7;
}

.dark-mode .action-update,
[data-theme='dark'] .action-update {
	background: #1e40af;
	color: #dbeafe;
}

.dark-mode .action-delete,
[data-theme='dark'] .action-delete {
	background: #991b1b;
	color: #fee2e2;
}
</style>
