<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useItems, useCollections, resolveApiBaseUrl } from '@directus/composables';

const route = useRoute();
const router = useRouter();
const itemId = computed(() => String(route.params.id ?? ''));

const { data: collections, loading: collectionsLoading } = useCollections();
const collectionName = ref<string>('');
const itemData = ref<Record<string, unknown> | null>(null);
const itemLoading = ref(false);
const itemError = ref<Error | null>(null);

// Pick first available collection; the detail page is generic across all collections
watch(
	collections,
	(cols) => {
		if (cols.length > 0 && !collectionName.value) {
			collectionName.value = cols[0].collection;
		}
	},
	{ immediate: true },
);

async function fetchItem(collection: string, id: string) {
	if (!collection || !id) return;
	itemLoading.value = true;
	itemError.value = null;
	try {
		const resp = await fetch(
			`${resolveApiBaseUrl()}/items/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
		);
		if (!resp.ok) throw new Error(`Item not found (${resp.status})`);
		const result = (await resp.json()) as { data: Record<string, unknown> };
		itemData.value = result.data ?? null;
	} catch (err) {
		itemError.value = err instanceof Error ? err : new Error('Failed to load item');
		itemData.value = null;
	} finally {
		itemLoading.value = false;
	}
}

watch(
	[collectionName, itemId],
	([coll, id]) => {
		if (coll && id) fetchItem(coll, id);
	},
	{ immediate: true },
);

async function handleDelete() {
	if (!itemId.value) return;
	if (!confirm('Are you sure you want to delete this item?')) return;
	const instance = useItems(collectionName.value);
	await instance.deleteItem(itemId.value);
	router.push('/items');
}
</script>

<template>
	<div class="detail-view">
		<button class="back-btn" @click="router.push('/items')">← Back to list</button>

		<div v-if="collectionsLoading" class="detail-loading">Loading collections...</div>
		<div v-else-if="!collectionName" class="detail-empty">No collections available.</div>

		<div v-else class="detail-card">
			<h1>Item Details</h1>
			<div class="detail-meta">
				<span class="meta-item"><strong>Collection:</strong> {{ collectionName }}</span>
				<span class="meta-item"><strong>ID:</strong> {{ itemId }}</span>
			</div>

			<div v-if="itemLoading" class="detail-loading">Loading item...</div>
			<div v-else-if="itemError" class="detail-error">{{ itemError.message }}</div>
			<div v-else-if="itemData" class="detail-content">
				<div v-for="(value, key) in itemData" :key="key" class="detail-field">
					<span class="detail-field-label">{{ key }}</span>
					<span class="detail-field-value">{{ value === null || value === undefined ? '—' : String(value) }}</span>
				</div>
			</div>
			<div v-else class="detail-empty">Item not found.</div>

			<div class="detail-actions">
				<button class="btn btn-edit" @click="router.push(`/items?edit=${itemId}`)">Edit</button>
				<button class="btn btn-delete" @click="handleDelete">Delete</button>
			</div>
		</div>
	</div>
</template>

<style scoped>
.detail-view {
	max-inline-size: 800px;
}

.back-btn {
	background: none;
	border: none;
	color: var(--accent);
	font: inherit;
	font-size: 0.9375rem;
	cursor: pointer;
	padding: 0;
	margin-block-end: 1rem;
}

.back-btn:hover {
	text-decoration: underline;
}

.detail-loading,
.detail-error,
.detail-empty {
	padding: 2rem;
	text-align: center;
	color: var(--ink-soft);
}

.detail-error {
	color: #b3261e;
}

.detail-card {
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1.5rem;
}

.detail-card h1 {
	margin: 0 0 1rem;
	font-size: 1.5rem;
}

.detail-meta {
	display: flex;
	gap: 1.5rem;
	margin-block-end: 1.5rem;
	font-size: 0.875rem;
	color: var(--ink-soft);
}

.detail-field {
	display: flex;
	gap: 1rem;
	padding: 0.75rem 0;
	border-block-end: 1px solid var(--rule);
}

.detail-field:last-child {
	border-block-end: none;
}

.detail-field-label {
	flex: 0 0 120px;
	font-weight: 600;
	color: var(--ink-soft);
	font-size: 0.875rem;
}

.detail-field-value {
	flex: 1;
	color: var(--ink);
	word-break: break-all;
}

.detail-actions {
	display: flex;
	gap: 0.75rem;
	margin-block-start: 1.5rem;
	padding-block-start: 1.5rem;
	border-block-start: 1px solid var(--rule);
}

.btn {
	padding: 0.5rem 1rem;
	font: inherit;
	font-size: 0.875rem;
	border-radius: 0.375rem;
	cursor: pointer;
	border: 1px solid var(--rule);
	background: var(--paper);
	color: var(--ink);
}

.btn-edit {
	background: var(--accent);
	color: var(--accent-ink);
	border-color: var(--accent);
}

.btn-delete {
	color: #b3261e;
}

.btn-delete:hover {
	background: #fee2e2;
}

.dark-mode .btn-delete:hover,
[data-theme='dark'] .btn-delete:hover {
	background: #7f1d1d;
}
</style>
