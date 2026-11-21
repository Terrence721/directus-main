<script setup lang="ts">
import { ref, computed, watch, unref } from 'vue';
import { useItems, useCollections } from '@directus/composables';

const { data: collections, loading: collectionsLoading } = useCollections();
const collectionName = ref<string>('demo_items');
const fields = ref<string[]>([]);
const sortDirection = ref<'asc' | 'desc'>('asc');
const sortField = ref<string>('id');
const filterValue = ref<string>('');
const page = ref(1);
const pageSize = ref(10);

let itemsInstance: ReturnType<typeof useItems> | null = null;

// Pre-compute selected collection + its fields to avoid nested find() expressions in templates.
const selectedCollection = computed(() =>
	collections.value?.find((c) => c.collection === collectionName.value),
);
const activeFields = computed(() => selectedCollection.value?.fields ?? []);
const collectionLabel = computed(() => selectedCollection.value?.label ?? collectionName.value);

watch(collections, (cols) => {
	if (!itemsInstance && cols.length > 0) {
		const first = cols[0];
		collectionName.value = first.collection;
		fields.value = first.fields.map((f) => f.name);
	}
}, { immediate: true });

watch([collectionName, fields, sortField, sortDirection, filterValue, page, pageSize], () => {
	const coll = collectionName.value;
	const sort = sortField.value ? `${sortDirection.value === 'desc' ? '-' : ''}${sortField.value}` : '';
	const filterOp = filterValue.value.trim()
		? { [sortField.value]: `_ilike|${filterValue.value}` }
		: {};
	itemsInstance = useItems(coll, {
		page: page.value,
		limit: pageSize.value,
		sort,
		filters: Object.keys(filterOp).length ? filterOp : undefined,
	});
});

// Access first element synchronously after creation
const itemRef = computed(() => itemsInstance ?? null);

function rowKey(row: unknown, index: number): string {
	const id = (row as Record<string, unknown>)['id'];
	return typeof id === 'string' || typeof id === 'number' ? `id:${typeof id}:${id}` : `index:${index}`;
}

// Create item form
const newItemForm = ref<Record<string, unknown>>({});
const creating = ref(false);
const createError = ref<Error | null>(null);

// Edit item state
const editingItemId = ref<string | null>(null);
const editingForm = ref<Record<string, unknown>>({});
const editingError = ref<Error | null>(null);

function clearForm() {
	newItemForm.value = {};
	createError.value = null;
}

function startEdit(row: Record<string, unknown>) {
	const id = row.id;
	editingItemId.value = typeof id === 'string' || typeof id === 'number' ? String(id) : null;
	editingForm.value = { ...row };
	editingError.value = null;
}

function cancelEdit() {
	editingItemId.value = null;
	editingForm.value = {};
	editingError.value = null;
}

async function handleCreate() {
	const instance = itemsInstance;
	if (creating.value || instance === null) return;
	creating.value = true;
	createError.value = null;

	try {
		const created = await instance.createItem(newItemForm.value);
		if (created) {
			clearForm();
			await instance.refresh();
		}
	} catch (err) {
		createError.value = err instanceof Error ? err : new Error('Create failed');
	} finally {
		creating.value = false;
	}
}

async function handleSaveEdit() {
	const instance = itemsInstance;
	if (!editingItemId.value || !instance || creating.value) return;
	creating.value = true;
	editingError.value = null;

	try {
		await instance.updateItem(editingItemId.value, editingForm.value);
		cancelEdit();
		await instance.refresh();
	} catch (err) {
		editingError.value = err instanceof Error ? err : new Error('Update failed');
	} finally {
		creating.value = false;
	}
}

async function handleDelete(itemId: string) {
	const instance = itemsInstance;
	if (!instance) return;
	if (!confirm('Are you sure you want to delete this item?')) return;
	await instance.deleteItem(itemId);
	await instance.refresh();
}
</script>

<template>
	<div class="items-view">
		<aside class="items-sidebar">
			<h2>Collections</h2>
			<p v-if="collectionsLoading" class="items-sidebar__loading">Loading…</p>
			<div v-else-if="collections.length === 0" class="items-sidebar__empty">No collections found.</div>
			<ul v-else class="coll-list">
				<li v-for="coll in collections" :key="coll.collection">
					<button
						type="button"
						class="coll-list__button"
						:class="{ 'coll-list__button--selected': coll.collection === collectionName }"
						:aria-pressed="coll.collection === collectionName"
						@click="collectionName = coll.collection"
					>
						{{ coll.label ?? coll.collection }}
						<span class="coll-count">{{ coll.sampleCount }}</span>
					</button>
				</li>
			</ul>
		</aside>

		<div class="items-main">
			<header class="items-toolbar">
				<h1>{{ collectionLabel }}</h1>
				<div class="items-toolbar__controls">
					<select v-model="fields" multiple class="items-select" aria-label="Columns">
						<option v-for="f in activeFields" :key="f.name" :value="f.name">{{ f.name }}</option>
					</select>
					<select v-model="sortField" class="items-select">
						<option v-for="f in activeFields" :key="f.name" :value="f.name">{{ f.name }}</option>
					</select>
					<button class="items-btn" @click="sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'">
						{{ sortDirection === 'asc' ? '↑ Asc' : '↓ Desc' }}
					</button>
					<input
						v-model="filterValue"
						placeholder="Filter…"
						class="items-input"
					/>
					<button v-if="!creating" class="items-btn" @click="handleCreate">
						{{ creating ? 'Creating…' : 'Create new' }}
					</button>
				</div>
			</header>

			<div v-if="itemRef" class="create-form">
				<div class="create-form__header">
					<h2>Create new item</h2>
					<button class="create-form__close" @click="clearForm">✕</button>
				</div>
				<p v-if="createError" class="create-form__error">{{ createError.message }}</p>

				<!-- title -->
				<label>
					Title
					<input
						v-model="newItemForm.title"
						type="text"
						placeholder="Enter title"
						class="create-form__input"
					/>
				</label>

				<!-- status -->
				<label>
					Status
					<select v-model="newItemForm.status" class="create-form__input">
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
				</label>

				<!-- other fields -->
				<div v-if="activeFields.length > 2">
					<h3 class="create-form__section">Additional fields</h3>
					<fieldset v-for="f in activeFields" :key="f.name">
						<label>{{ f.name }}</label>
						<input
							v-model="newItemForm[f.name]"
							type="text"
							placeholder="Enter value"
							class="create-form__input"
						/>
					</fieldset>
				</div>

				<button
					class="create-form__submit"
					:disabled="creating"
					@click="handleCreate"
				>
					{{ creating ? 'Saving…' : 'Create' }}
				</button>
			</div>

			<div v-if="itemRef?.loading" class="items-loading">Loading…</div>
			<div v-else-if="itemRef?.error.value" class="items-error">{{ itemRef.error.value?.message }}</div>
			<table v-else class="items-table">
				<thead>
					<tr>
						<th v-for="field in fields" :key="field">{{ field }}</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="itemRef?.data.value.length === 0">
						<td :colspan="fields.length + 1" style="text-align:center;color:var(--ink-soft)">No results.</td>
					</tr>
					<tr v-for="(row, index) in itemRef?.data.value" :key="rowKey(row, index)" :class="{ 'items-table--editing': editingItemId === (row as Record<string, unknown>)['id'] }">
						<template v-for="field in fields" :key="field">
							<td>{{ (row as Record<string, unknown>)[field] ?? '—' }}</td>
						</template>
						<td class="items-table__actions">
							<button v-if="editingItemId !== (row as Record<string, unknown>)['id']" class="items-action-btn" @click="startEdit(row as Record<string, unknown>)">Edit</button>
							<button class="items-action-btn items-action-btn--delete" @click="handleDelete((row as Record<string, unknown>)['id'] as string)">Delete</button>
						</td>
					</tr>
				</tbody>
			</table>

			<!-- Inline edit form -->
			<div v-if="editingItemId && itemRef" class="create-form">
				<div class="create-form__header">
					<h2>Edit item</h2>
					<button class="create-form__close" @click="cancelEdit">✕</button>
				</div>
				<p v-if="editingError" class="create-form__error">{{ editingError.message }}</p>

				<label>
					Title
					<input v-model="editingForm.title" type="text" class="create-form__input" />
				</label>

				<label>
					Status
					<select v-model="editingForm.status" class="create-form__input">
						<option value="draft">Draft</option>
						<option value="published">Published</option>
					</select>
				</label>

				<div v-if="activeFields.length > 2">
					<h3 class="create-form__section">Additional fields</h3>
					<fieldset v-for="f in activeFields" :key="f.name">
						<label>{{ f.name }}</label>
						<input v-model="editingForm[f.name]" type="text" class="create-form__input" />
					</fieldset>
				</div>

				<button class="create-form__submit" :disabled="creating" @click="handleSaveEdit">
					{{ creating ? 'Saving…' : 'Save changes' }}
				</button>
			</div>

			<footer v-if="itemRef" class="items-pagination">
				<button :disabled="itemRef.page.value <= 1" @click="itemRef.setPage(itemRef.page.value - 1)">Prev</button>
				<span>Page {{ itemRef.page.value }} of {{ unref(itemRef.total) ? Math.ceil((unref(itemRef.total) ?? 0) / unref(itemRef.limit)) : 1 }}</span>
				<button :disabled="itemRef.page.value >= Math.ceil((unref(itemRef.total) ?? 0) / unref(itemRef.limit))" @click="itemRef.setPage(itemRef.page.value + 1)">Next</button>
			</footer>
		</div>
	</div>
</template>

<style scoped>
.items-view {
	display: flex;
	gap: 1.5rem;
	align-items: start;
}

.items-sidebar {
	width: 200px;
	flex-shrink: 0;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1rem;
	position: sticky;
	top: 0;
	height: fit-content;
	max-height: calc(100vh - 6rem);
	overflow-y: auto;
}

.items-sidebar h2 {
	margin: 0 0 0.75rem;
	font-size: 0.875rem;
	color: var(--ink-soft);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.items-sidebar__loading,
.items-sidebar__empty {
	font-size: 0.8125rem;
	color: var(--ink-soft);
}

.coll-list {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.coll-list__button {
	width: 100%;
	padding: 0.5rem;
	text-align: start;
	font: inherit;
	color: var(--ink);
	background: transparent;
	border: 0;
	border-radius: 0.375rem;
	cursor: pointer;
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 0.5rem;
}

.coll-list__button:hover {
	background: rgba(0,0,0,0.04);
}

.dark-mode .coll-list__button:hover {
	background: rgba(255,255,255,0.05);
}

.coll-list__button--selected {
	background: var(--accent);
	color: var(--accent-ink);
}

.coll-count {
	font-size: 0.75rem;
	opacity: 0.7;
}

.items-main {
	flex: 1;
	min-width: 0;
}

.items-toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1rem;
}

.items-toolbar h1 {
	margin: 0;
	font-size: 1.25rem;
}

.items-toolbar__controls {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	flex-wrap: wrap;
	flex: 1;
	justify-content: flex-end;
}

.items-select,
.items-input {
	padding: 0.375rem 0.5rem;
	font: inherit;
	font-size: 0.8125rem;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
}

.items-btn {
	padding: 0.375rem 0.75rem;
	font: inherit;
	font-size: 0.8125rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
}

.items-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.items-table th,
.items-table td {
	padding: 0.5rem 0.75rem;
	text-align: start;
	border-bottom: 1px solid var(--rule);
}

.items-table th {
	font-weight: 600;
	color: var(--ink-soft);
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	background: var(--paper-2);
}

.items-table tr:hover td {
	background: var(--paper-2);
}

.items-loading,
.items-error {
	padding: 2rem;
	text-align: center;
	color: var(--ink-soft);
}

.items-error {
	color: #b3261e;
}

.items-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	margin-top: 1rem;
	font-size: 0.875rem;
}

.items-pagination button {
	padding: 0.375rem 0.75rem;
	font: inherit;
	font-size: 0.8125rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	cursor: pointer;
}

.items-pagination button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.create-form {
	margin-top: 1.5rem;
	padding: 1.5rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
}

.create-form__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.create-form__header h2 {
	margin: 0;
	font-size: 1.25rem;
}

.create-form__close {
	background: none;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;
	color: var(--ink-soft);
}

.create-form__close:hover {
	color: var(--accent);
}

.create-form__error {
	margin: 0.5rem 0;
	font-size: 0.875rem;
	color: #b3261e;
}

.create-form__section {
	margin: 1rem 0 0.5rem;
	font-size: 0.875rem;
	color: var(--ink-soft);
	border-top: 1px solid var(--rule);
	padding-top: 0.5rem;
}

.create-form__label {
	display: block;
	margin-bottom: 0.25rem;
	font-size: 0.8125rem;
	color: var(--ink-soft);
}

.create-form__input {
	width: 100%;
	padding: 0.375rem 0.5rem;
	font: inherit;
	font-size: 0.8125rem;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
}

.create-form__input:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 1px;
}

.create-form__submit {
	width: 100%;
	padding: 0.375rem 0.75rem;
	font: inherit;
	font-size: 0.8125rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
}

.create-form__submit:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

@media (max-width: 768px) {
	.items-view {
		flex-direction: column;
	}

	.items-sidebar {
		width: 100%;
		position: static;
	}
}
</style>
