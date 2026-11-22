<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resolveApiBaseUrl } from '@directus/composables';

const route = useRoute();
const router = useRouter();

const collection = computed(() => String(route.params.collection ?? ''));
const itemId = computed(() => String(route.params.id ?? ''));

const fields = ref<{ name: string; type?: string }[]>([]);
const itemData = ref<Record<string, unknown>>({});
const loading = ref(false);
const error = ref<Error | null>(null);
const saving = ref(false);

onMounted(async () => {
	if (!collection.value || !itemId.value) return;
	await loadItem();
});

async function loadItem() {
	loading.value = true;
	error.value = null;

	try {
		const baseUrl = resolveApiBaseUrl();
		const resp = await fetch(`${baseUrl}/items/${collection.value}/${itemId.value}`);
		if (!resp.ok) throw new Error('Item not found');
		const json = await resp.json();
		itemData.value = json.data ?? {};

		// Load fields for this collection
		const fieldsResp = await fetch(`${baseUrl}/collections/${collection.value}`);
		const fieldsJson = await fieldsResp.json();
		fields.value = fieldsJson.data?.fields ?? [];
	} catch (err) {
		error.value = err instanceof Error ? err : new Error('Failed to load item');
	} finally {
		loading.value = false;
	}
}

async function handleSave(field: string) {
	saving.value = true;
	try {
		const baseUrl = resolveApiBaseUrl();
		const resp = await fetch(`${baseUrl}/items/${collection.value}/${itemId.value}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ [field]: itemData.value[field] }),
		});
		if (!resp.ok) throw new Error('Failed to save');
	} finally {
		saving.value = false;
	}
}

function formatFieldValue(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'string') return value;
	return JSON.stringify(value) ?? '';
}

function updateField(field: string, event: Event) {
	itemData.value[field] = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
}

function goBack() {
	router.push(`/content/${collection.value}`);
}

function deleteItem() {
	if (!confirm('Delete this item?')) return;
	fetch(`${resolveApiBaseUrl()}/items/${collection.value}/${itemId.value}`, { method: 'DELETE' })
		.then(() => router.push(`/content/${collection.value}`))
		.catch(console.error);
}
</script>

<template>
	<div v-if="!loading && !error" class="detail-page">
		<div class="detail-header">
			<button class="btn-back" @click="goBack">← Back</button>
			<h1>{{ itemData.id ?? 'Editing' }}</h1>
			<div class="detail-actions">
				<button class="btn-delete" @click="deleteItem">Delete</button>
			</div>
		</div>

		<div v-for="field in fields" :key="field.name" class="field-group">
			<label class="field-label">{{ field.name }}</label>
			<input
				v-if="field.type !== 'json' && field.type !== 'array'"
				:value="formatFieldValue(itemData[field.name])"
				:type="field.type === 'timestamp' ? 'datetime-local' : 'text'"
				class="field-input"
				@input="updateField(field.name, $event)"
				@blur="handleSave(field.name)"
			/>
			<textarea
				v-else
				:value="formatFieldValue(itemData[field.name])"
				class="field-textarea"
				@input="updateField(field.name, $event)"
				@blur="handleSave(field.name)"
			/>
		</div>
	</div>

	<div v-else-if="loading" class="loading">Loading...</div>
	<div v-else class="error">
		<p>{{ error?.message }}</p>
		<button @click="loadItem">Retry</button>
	</div>
</template>

<style scoped>
.detail-page {
	max-inline-size: 800px;
	margin: 0 auto;
	padding: 2rem;
}

.detail-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-block-end: 2rem;
}

.btn-back {
	padding: 0.5rem 1rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 4px;
	cursor: pointer;
}

.detail-actions {
	margin-inline-start: auto;
}

.btn-delete {
	padding: 0.5rem 1rem;
	background: #dc2626;
	color: white;
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.field-group {
	margin-block-end: 1rem;
}

.field-label {
	display: block;
	font-weight: 600;
	margin-block-end: 0.25rem;
	color: var(--ink-soft);
	font-size: 0.875rem;
}

.field-input,
.field-textarea {
	inline-size: 100%;
	padding: 0.5rem;
	border: 1px solid var(--rule);
	border-radius: 4px;
	font-family: inherit;
	font-size: 0.9375rem;
}

.field-textarea {
	min-block-size: 100px;
	resize: vertical;
}

.loading,
.error {
	text-align: center;
	padding: 2rem;
}

.error button {
	margin-block-start: 0.5rem;
	padding: 0.5rem 1rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 4px;
	cursor: pointer;
}
</style>
