<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
const selectedCollection = computed(() => collections.value?.find((c) => c.collection === collectionName.value));
const collectionLabel = computed(() => selectedCollection.value?.label ?? collectionName.value);

watch(
	collections,
	(cols) => {
		if (!itemsInstance && cols.length > 0) {
			const first = cols[0];
			collectionName.value = first.collection;
			fields.value = first.fields.map((f) => f.name);
		}
	},
	{ immediate: true },
);

watch([collectionName, fields, sortField, sortDirection, filterValue, page, pageSize], () => {
	const coll = collectionName.value;
	const sort = sortField.value ? `${sortDirection.value === 'desc' ? '-' : ''}${sortField.value}` : '';
	const filterOp = filterValue.value.trim() ? { [sortField.value]: `_icontains|${filterValue.value}` } : {};
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
const creatingItem = ref(false);
const createError = ref<Error | null>(null);

// Edit item state
const editingItemId = ref<string | null>(null);
const editingForm = ref<Record<string, unknown>>({});
const editingError = ref<Error | null>(null);

function clearForm() {
	creating.value = false;
	creatingItem.value = false;
	newItemForm.value = {};
	createError.value = null;
}

async function handleCreate() {
	creatingItem.value = true;
	createError.value = null;

	try {
		const created = await itemsInstance?.createItem(newItemForm.value);

		if (created) {
			clearForm();
			await itemRef.value?.refresh();
		}
	} catch (error) {
		createError.value = error instanceof Error ? error : new Error(String(error));
	} finally {
		creatingItem.value = false;
	}
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

async function handleSaveEdit() {
	if (!editingItemId.value) return;
	creating.value = true;
	editingError.value = null;
	const updated = await itemsInstance?.updateItem(editingItemId.value, editingForm.value);
	if (updated) {
		cancelEdit();
	} else {
		creating.value = false;
	}
}

async function handleDelete(id: string) {
	if (!id || !confirm('Are you sure you want to delete this item?')) return;
	const result = await itemsInstance?.deleteItem(id);
	if (result) {
		if (itemRef.value) {
			// Navigate to previous page if currently on last page and it's the last item
			if (itemRef.value.page.value > 1 && itemRef.value.data.value.length === 1) {
				itemRef.value.setPage(itemRef.value.page.value - 1);
			} else {
				await itemRef.value.refresh();
			}
		}
	}
}
</script>

<template>
	<div class="items-view">
		<aside class="items-sidebar">
			<h2>Collections</h2>

			<div v-if="collectionsLoading" class="items-sidebar__loading">Loading...</div>
			<div v-else-if="collections.length === 0" class="items-sidebar__empty">No collections</div>
			<ul v-else class="coll-list">
				<li v-for="coll in collections" :key="coll.collection" :class="{ active: coll.collection === collectionName }">
					<button class="coll-item" @click="collectionName = coll.collection">
						{{ coll.label }}
					</button>
				</li>
			</ul>
		</aside>

		<div class="items-main">
			<div class="items-header">
				<h1>{{ collectionLabel }}</h1>
				<button
					class="btn"
					@click="
						newItemForm = {};
						creating = true;
					"
				>
					Create
				</button>
			</div>

			<div v-if="itemRef?.loading" class="items-loading">Loading...</div>
			<div v-else-if="itemRef?.error?.value" class="items-error">{{ itemRef.error.value.message }}</div>
			<div v-else-if="itemRef?.data.value.length === 0" class="items-empty">No items found.</div>
			<table v-else class="items-table">
				<thead>
					<tr>
						<th v-for="field in fields" :key="field">{{ field }}</th>
						<th class="items-table__actions">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr v-if="itemRef?.data.value.length === 0">
						<td :colspan="fields.length + 1" style="text-align: center; color: var(--ink-soft)">No results.</td>
					</tr>
					<template v-for="(row, index) in itemRef?.data.value" :key="rowKey(row, index)">
						<tr :class="{ 'items-table--editing': editingItemId === (row as Record<string, unknown>)['id'] }">
							<template v-for="field in fields" :key="field">
								<td>{{ row[field] ?? '-' }}</td>
							</template>
							<td class="items-table__actions">
								<button
									v-if="editingItemId !== (row as Record<string, unknown>)['id']"
									class="items-action-btn"
									@click="startEdit(row as Record<string, unknown>)"
								>
									Edit
								</button>
								<button
									class="items-action-btn items-action-btn--delete"
									@click="handleDelete((row as Record<string, unknown>)['id'] as string)"
								>
									Delete
								</button>
							</td>
						</tr>
					</template>
				</tbody>
			</table>

			<footer v-if="itemRef" class="items-pagination">
				<button :disabled="itemRef.page.value <= 1" @click="itemRef.setPage(itemRef.page.value - 1)">Prev</button>
				<span
					>Page {{ itemRef.page.value }} of
					{{ itemRef.total.value ? Math.ceil(itemRef.total.value / (itemRef.limit.value ?? 1)) : 1 }}</span
				>
				<button
					:disabled="itemRef.page.value >= Math.ceil((itemRef.total.value ?? 0) / (itemRef.limit.value ?? 1))"
					@click="itemRef.setPage(itemRef.page.value + 1)"
				>
					Next
				</button>
			</footer>
		</div>
	</div>

	<!-- Create item form -->
	<div v-if="creating" class="create-form">
		<div class="create-form__header">
			<h2>Create item</h2>
			<button class="create-form__close" @click="clearForm">✕</button>
		</div>
		<p v-if="createError" class="create-form__error">{{ createError.message }}</p>

		<form class="create-form__body" @submit.prevent="handleCreate">
			<div v-for="field in fields" :key="field" class="create-form__field">
				<label>{{ field }}</label>
				<input v-model="newItemForm[field]" placeholder="Enter value" class="create-form__input" />
			</div>

			<div class="create-form__actions">
				<button class="create-form__cancel" @click="clearForm">Cancel</button>
				<button class="create-form__submit" :disabled="creating" @click="handleCreate">
					{{ creating ? 'Saving…' : 'Create' }}
				</button>
			</div>
		</form>
	</div>

	<!-- Edit item form -->
	<div v-if="editingItemId && itemRef" class="create-form">
		<div class="create-form__header">
			<h2>Edit item</h2>
			<button class="create-form__close" @click="cancelEdit">✕</button>
		</div>
		<p v-if="editingError" class="create-form__error">{{ editingError.message }}</p>

		<form class="create-form__body" @submit.prevent="handleSaveEdit">
			<div v-for="field in fields" :key="field" class="create-form__field">
				<label>{{ field }}</label>
				<input v-model="editingForm[field]" placeholder="Enter value" class="create-form__input" />
			</div>

			<div class="create-form__actions">
				<button class="create-form__cancel" @click="cancelEdit">Cancel</button>
				<button class="create-form__submit" :disabled="creating" @click="handleSaveEdit">
					{{ creating ? 'Saving…' : 'Save changes' }}
				</button>
			</div>
		</form>
	</div>
</template>

<style scoped>
.items-view {
	display: flex;
	gap: 1.5rem;
	align-items: start;
}

.items-sidebar {
	inline-size: 200px;
	flex-shrink: 0;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1rem;
	position: sticky;
	inset-block-start: 0;
	block-size: fit-content;
	max-block-size: calc(100vh - 6rem);
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
}

.coll-item {
	display: block;
	padding: 0.5rem 0.75rem;
	font: inherit;
	font-size: 0.875rem;
	background: none;
	border: none;
	color: inherit;
	text-align: start;
	border-radius: 0.375rem;
	cursor: pointer;
}

.coll-item:hover {
	background: rgb(0 0 0 / 4%);
}

.coll-item.active {
	background: var(--accent);
	color: var(--accent-ink);
}

.items-main {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.items-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-block-end: 1rem;
}

.items-header h1 {
	margin: 0;
	font-size: 1.5rem;
}

.items-loading,
.items-error,
.items-empty {
	padding: 2rem;
	text-align: center;
	color: var(--ink-soft);
}

.items-error {
	color: #b3261e;
}

.items-table {
	inline-size: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.items-table th,
.items-table td {
	padding: 0.5rem 0.75rem;
	text-align: start;
	border-block-end: 1px solid var(--rule);
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

.items-table__actions {
	inline-size: 120px;
	text-align: center;
}

.items-table--editing td {
	background: var(--accent-soft);
}

.items-action-btn {
	padding: 0.375rem 0.75rem;
	font: inherit;
	font-size: 0.75rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.25rem;
	cursor: pointer;
	margin: 0.25rem 0;
	display: block;
}

.items-action-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.items-action-btn--delete {
	color: #b3261e;
	border-color: #fee2e2;
}

.items-action-btn--delete:hover {
	background: #fee2e2;
}

.dark-mode .items-action-btn--delete:hover,
[data-theme='dark'] .items-action-btn--delete:hover {
	background: #7f1d1d;
}

.items-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	margin-block-start: 1rem;
	font-size: 0.875rem;
}

.items-pagination button {
	padding: 0.375rem 0.75rem;
	font: inherit;
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
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1.5rem;
	margin-block-start: 1.5rem;
}

.create-form__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-block-end: 1rem;
}

.create-form__header h2 {
	margin: 0;
	font-size: 1.5rem;
}

.create-form__close {
	background: none;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;
	color: var(--ink-soft);
}

.create-form__error {
	margin: 0 0 1rem;
	color: #b3261e;
	font-size: 0.875rem;
}

.create-form__body {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
	margin-block-end: 1rem;
}

.create-form__field {
	display: flex;
	flex-direction: column;
}

.create-form__field label {
	margin-block-end: 0.25rem;
	font-size: 0.875rem;
	color: var(--ink-soft);
}

.create-form__input {
	padding: 0.5rem 0.75rem;
	font: inherit;
	font-size: 0.875rem;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
}

.create-form__input:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 1px;
}

.create-form__actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.5rem;
}

.create-form__cancel {
	background: none;
	border: none;
	font: inherit;
	font-size: 0.875rem;
	color: var(--ink-soft);
	cursor: pointer;
}

.create-form__cancel:hover {
	text-decoration: underline;
}

.create-form__submit {
	padding: 0.5rem 1.25rem;
	font: inherit;
	font-weight: 600;
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
</style>
