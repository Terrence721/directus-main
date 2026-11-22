<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useItems } from '@directus/composables';

const router = useRouter();
const route = useRoute();

const collection = route.params.collection as string;
const id = route.params.id as string;

// Item detail state
const { data, error, loading, refresh, deleteItem } = useItems(collection, {
	filters: { id: { _eq: id } },
	limit: 1,
	fields: [],
});

// Reload when params change
watch([route.params], () => {
	refresh();
});

// Get item (first of array)
const item = computed<Record<string, unknown> | null>(
	() => (data.value?.[0] as Record<string, unknown> | undefined) ?? null,
);

// Filtered fields for rendering
const filteredFields = computed((): [string, unknown][] => {
	if (!item.value) return [];
	return Object.entries(item.value).filter(([, value]) => value !== null && value !== undefined);
});

// Navigate back
function goBack() {
	router.push({ name: 'visual-overview', params: { collection } });
}

// Edit item
function editItem() {
	router.push({
		name: 'visual-item',
		params: { collection, id },
		query: { edit: 'true' },
	});
}

// Delete item
async function deleteItemHandler() {
	if (confirm('Are you sure you want to delete this item?')) {
		await deleteItem(id);
		goBack();
	}
}

// Format date
function formatDate(dateStr: string): string {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleDateString();
}
</script>

<template>
	<div class="visual-detail">
		<!-- Header -->
		<header class="header">
			<div class="header__actions">
				<button class="btn" @click="goBack">Back</button>
				<button class="btn btn--primary" @click="editItem">Edit</button>
				<button class="btn" @click="deleteItemHandler">Delete</button>
			</div>
		</header>

		<!-- Loading state -->
		<div v-if="loading" class="loading">Loading item...</div>

		<!-- Error state -->
		<div v-else-if="error" class="error">
			<p>{{ error.message }}</p>
			<button @click="refresh()">Retry</button>
		</div>

		<!-- Item not found -->
		<div v-else-if="!item" class="empty">Item not found</div>

		<!-- Item details -->
		<div v-else class="item-detail">
			<div v-for="[field, value] in filteredFields" :key="field" class="field-row">
				<div class="field-label">{{ field }}</div>
				<div class="field-value">
					<template v-if="field === 'created_at' || field === 'updated_at'">
						{{ formatDate(String(value)) }}
					</template>
					<template v-else-if="field === 'status' || field === 'position'">
						<strong>{{ value }}</strong>
					</template>
					<template v-else-if="Array.isArray(value)">
						{{ value.join(', ') }}
					</template>
					<template v-else>
						{{ value }}
					</template>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.visual-detail {
	padding: 2rem;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-block-end: 1.5rem;
	gap: 1rem;
}

.btn {
	padding: 0.75rem 1.5rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	font-weight: 600;
	cursor: pointer;
	margin-inline-end: 0.5rem;
}

.btn:hover {
	background: var(--accent-hover);
}

.btn--primary {
	background: var(--accent);
	color: var(--accent-ink);
}

.btn--primary:hover {
	background: var(--accent-hover);
}

.loading,
.error,
.empty {
	text-align: center;
	padding: 3rem;
	color: var(--ink-soft);
}

.error {
	background: var(--error-bg);
	padding: 1rem;
	border-radius: 8px;
	margin-block-end: 1rem;
}

.error button {
	margin-block-start: 0.5rem;
	padding: 0.375rem 0.75rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.item-detail {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1rem;
	max-inline-size: 800px;
	margin: 0 auto;
}

.field-row {
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	padding: 1rem;
	background: var(--paper-2);
}

.field-row:hover {
	background: var(--paper);
	border-color: var(--accent);
}

.field-label {
	font-weight: 600;
	margin-block-end: 0.5rem;
	color: var(--ink);
	font-size: 0.875rem;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.field-value {
	color: var(--ink-soft);
	font-size: 0.9375rem;
	line-height: 1.4;
}

.field-value strong {
	color: var(--ink);
}
</style>
