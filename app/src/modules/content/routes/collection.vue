<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCollectionsManager } from '../composables/use-collections-manager.js';
import { useNavigation } from '../composables/use-navigation.js';

const router = useRouter();
const { flatCollections, loading: collectionsLoading, fetchCollections } = useCollectionsManager();
const { activeCollection, collapsedGroups, toggleGroup } = useNavigation();

// Collection browser state
const searchTerm = ref('');
const sortField = ref<string>('');
const sortOrder = ref<'asc' | 'desc'>('asc');
const page = ref(1);
const pageSize = ref(20);

// Columns based on selected collection
interface FieldDef {
	name: string;
	type: string;
}

const fields = ref<FieldDef[]>([]);
const items = ref<Record<string, unknown>[] | null>(null);
const totalItems = ref(0);
const totalPages = ref(1);
const loadingItems = ref(false);
const itemError = ref<Error | null>(null);

// Grouped collections by meta.group
const groupedCollections = computed(() => {
	const groups: Record<string, typeof flatCollections.value> = {};
	const ungrouped: typeof flatCollections.value = [];

	for (const coll of flatCollections.value) {
		const group =
			coll.meta && 'group' in coll.meta && typeof coll.meta.group === 'string' ? coll.meta.group : undefined;
		if (group) {
			if (!groups[group]) groups[group] = [];
			groups[group].push(coll);
		} else {
			ungrouped.push(coll);
		}
	}

	return { groups, ungrouped };
});

// Fetch fields when collection changes
watch(activeCollection, async (coll) => {
	if (!coll) return;
	fields.value = [];
	items.value = null;
	page.value = 1;
	await fetchFields(coll);
	await fetchItems();
});

async function fetchFields(collection: string) {
	try {
		const baseUrl = new URL(window.location.href).origin;
		const resp = await fetch(`${baseUrl}/collections/${encodeURIComponent(collection)}`);
		if (!resp.ok) throw new Error(`Failed to load collection ${collection}`);
		const json = await resp.json();
		fields.value = json.data?.fields ?? [];
	} catch (err) {
		console.error(err);
	}
}

async function fetchItems() {
	if (!activeCollection.value) return;

	loadingItems.value = true;
	itemError.value = null;

	try {
		const baseUrl = window.location.protocol + '//' + window.location.host;
		const params = new URLSearchParams({
			page: String(page.value),
			limit: String(pageSize.value),
		});

		if (searchTerm.value.trim()) {
			params.set('_contains', searchTerm.value);
		}

		if (sortField.value) {
			params.set('_sort', `${sortOrder.value === 'desc' ? '-' : ''}${sortField.value}`);
		}

		const url = `${baseUrl}/items/${encodeURIComponent(activeCollection.value)}?${params}`;
		const resp = await fetch(url);

		if (!resp.ok) throw new Error(`Failed to fetch items (${resp.status})`);
		const data = await resp.json();

		const fetchedItems = data.data ?? [];
		items.value = fetchedItems;
		totalItems.value = data.total_count ?? fetchedItems.length;
		totalPages.value = Math.ceil((data.total_count ?? fetchedItems.length) / pageSize.value) || 1;
	} catch (err) {
		itemError.value = err instanceof Error ? err : new Error('Failed to load items');
		items.value = [];
		totalItems.value = 0;
		totalPages.value = 1;
	} finally {
		loadingItems.value = false;
	}
}

// Reload items when filters change
watch([searchTerm, sortField, sortOrder, page], () => {
	fetchItems();
});

// Get collection display name
function getCollectionLabel(collection: string): string {
	const found = flatCollections.value.find((c) => c.collection === collection);
	return found?.label ?? collection;
}

function navigateTo(collection: string) {
	activeCollection.value = collection;
	router.push(`/#/content/${collection}`);
}

function goToDetail(collection: string, id: string) {
	router.push(`/#/content/${collection}/${id}`);
}

function resetFilters() {
	searchTerm.value = '';
	sortField.value = '';
	sortOrder.value = 'asc';
	page.value = 1;
}

function prevPage() {
	if (page.value > 1) page.value--;
}

function nextPage() {
	if (page.value < totalPages.value) page.value++;
}
</script>

<template>
	<div class="content-browser">
		<!-- Sidebar with collection navigation -->
		<aside class="sidebar">
			<div class="sidebar__header">
				<h2>Collections</h2>
				<button class="btn-refresh" :disabled="collectionsLoading" @click="fetchCollections()">
					{{ collectionsLoading ? 'Loading...' : '↻' }}
				</button>
			</div>

			<!-- Ungrouped collections -->
			<div v-for="collection in groupedCollections.ungrouped" :key="collection.collection" class="nav-item">
				<button
					:class="['nav-btn', { 'nav-btn--active': activeCollection === collection.collection }]"
					@click="navigateTo(collection.collection)"
				>
					<span>{{ collection.label || collection.collection }}</span>
					<span class="nav-badge">{{ totalItems }}</span>
				</button>
			</div>

			<!-- Grouped collections -->
			<template v-for="(group, groupName) in groupedCollections.groups" :key="groupName">
				<div class="nav-group">
					<button class="nav-group-header" @click="toggleGroup(groupName)">
						<span>{{ groupName }}</span>
						<span class="nav-chevron" :class="{ 'nav-chevron--open': !collapsedGroups.has(groupName) }">▼</span>
					</button>
					<div v-if="!collapsedGroups.has(groupName)" class="nav-group-items">
						<button
							v-for="collection in group"
							:key="collection.collection"
							:class="['nav-btn', 'nav-btn--nested', { 'nav-btn--active': activeCollection === collection.collection }]"
							@click="navigateTo(collection.collection)"
						>
							{{ collection.label || collection.collection }}
						</button>
					</div>
				</div>
			</template>

			<p v-if="flatCollections.length === 0 && !collectionsLoading" class="empty-state">
				No collections yet. Add some in Settings → Data Model.
			</p>
		</aside>

		<!-- Main content area -->
		<main class="main">
			<!-- Header -->
			<header v-if="activeCollection" class="header">
				<h1 class="header__title">{{ getCollectionLabel(activeCollection) }}</h1>
				<div class="header__actions">
					<input v-model="searchTerm" type="text" placeholder="Search..." class="search-input" />
					<select v-model="sortField" class="sort-select">
						<option value="">Sort...</option>
						<option v-for="field in fields" :key="field.name" :value="field.name">
							{{ field.name }}
						</option>
					</select>
					<button class="sort-dir-btn" @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
						{{ sortOrder === 'asc' ? '↑' : '↓' }}
					</button>
					<button class="btn-reset" @click="resetFilters">Reset</button>
				</div>
			</header>

			<!-- No collection selected -->
			<div v-else class="no-collection">
				<p>Select a collection from the sidebar to browse items.</p>
			</div>

			<!-- Loading state -->
			<div v-if="loadingItems" class="loading">Loading items...</div>

			<!-- Error state -->
			<div v-else-if="itemError" class="error">
				<p>{{ itemError.message }}</p>
				<button @click="fetchItems()">Retry</button>
			</div>

			<!-- Items table -->
			<table v-else class="items-table">
				<thead>
					<tr>
						<th
							v-for="field in fields"
							:key="field.name"
							:class="{ sortable: field.type !== 'string' }"
							@click="
								field.type !== 'string'
									? ((sortField = field.name),
										(sortOrder = sortField === field.name ? (sortOrder === 'asc' ? 'desc' : 'asc') : 'asc'))
									: null
							"
						>
							{{ field.name }}
						</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					<template v-for="(item, index) in items" :key="index">
						<tr>
							<template v-for="field in fields" :key="field.name">
								<td @click="goToDetail(activeCollection!, item.id as string)">
									{{ item[field.name] ?? '—' }}
								</td>
							</template>
							<td>
								<button class="btn-edit" @click="goToDetail(activeCollection!, item.id as string)">Edit</button>
							</td>
						</tr>
					</template>
					<tr v-if="items && items.length === 0">
						<td :colspan="fields.length + 1" class="empty-row">No items in this collection yet.</td>
					</tr>
				</tbody>
			</table>

			<!-- Pagination -->
			<div v-if="totalPages > 1" class="pagination">
				<button :disabled="page <= 1" @click="prevPage">Previous</button>
				<span>Page {{ page }} of {{ totalPages }}</span>
				<button :disabled="page >= totalPages" @click="nextPage">Next</button>
			</div>
		</main>
	</div>
</template>

<style scoped>
.content-browser {
	display: flex;
	min-height: calc(100vh - 60px);
}

.sidebar {
	width: 260px;
	background: var(--paper-2);
	border-right: 1px solid var(--rule);
	padding: 1rem;
	flex-shrink: 0;
	overflow-y: auto;
}

.sidebar__header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.sidebar__header h2 {
	margin: 0;
	font-size: 1rem;
	color: var(--ink);
}

.btn-refresh {
	background: none;
	border: 1px solid var(--rule);
	border-radius: 4px;
	padding: 0.25rem 0.5rem;
	cursor: pointer;
	font-size: 0.875rem;
}

.nav-item,
.nav-group {
	margin-bottom: 0.25rem;
}

.nav-btn {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: none;
	border: none;
	text-align: left;
	cursor: pointer;
	border-radius: 4px;
	color: var(--ink);
	font-size: 0.875rem;
}

.nav-btn:hover {
	background: var(--hover);
}

.nav-btn--active {
	background: var(--accent);
	color: var(--accent-ink);
}

.nav-btn--active:hover {
	background: var(--accent-hover);
}

.nav-btn--nested {
	padding-left: 1.5rem;
	font-size: 0.8125rem;
}

.nav-badge {
	background: var(--ink-subdued);
	color: var(--paper);
	padding: 0.125rem 0.375rem;
	border-radius: 10px;
	font-size: 0.75rem;
}

.nav-group-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	padding: 0.5rem 0.75rem;
	background: none;
	border: none;
	text-align: left;
	cursor: pointer;
	font-weight: 600;
	font-size: 0.8125rem;
	color: var(--ink-soft);
}

.nav-group-items {
	margin-left: 0.5rem;
}

.nav-chevron {
	font-size: 0.625rem;
	transition: transform 0.2s;
}

.nav-chevron--open {
	transform: rotate(180deg);
}

.empty-state {
	font-size: 0.875rem;
	color: var(--ink-soft);
	padding: 1rem;
	text-align: center;
}

.main {
	flex: 1;
	padding: 1.5rem;
	overflow-x: auto;
}

.header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1.5rem;
	gap: 1rem;
	flex-wrap: wrap;
}

.header__title {
	margin: 0;
	font-size: 1.25rem;
}

.header__actions {
	display: flex;
	gap: 0.5rem;
	align-items: center;
}

.search-input {
	padding: 0.375rem 0.75rem;
	border: 1px solid var(--rule);
	border-radius: 4px;
	font-size: 0.875rem;
	min-width: 200px;
}

.sort-select {
	padding: 0.375rem 0.5rem;
	border: 1px solid var(--rule);
	border-radius: 4px;
	font-size: 0.875rem;
}

.sort-dir-btn {
	padding: 0.375rem 0.5rem;
	border: 1px solid var(--rule);
	border-radius: 4px;
	background: var(--paper);
	cursor: pointer;
}

.btn-reset {
	padding: 0.375rem 0.75rem;
	border: 1px solid var(--rule);
	border-radius: 4px;
	background: var(--paper);
	cursor: pointer;
	font-size: 0.875rem;
}

.no-collection {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 200px;
	color: var(--ink-soft);
}

.loading,
.empty-row {
	text-align: center;
	padding: 2rem;
	color: var(--ink-soft);
}

.error {
	padding: 1rem;
	background: var(--error-bg);
	border-radius: 8px;
	margin-bottom: 1rem;
}

.error button {
	margin-top: 0.5rem;
	padding: 0.375rem 0.75rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 4px;
	cursor: pointer;
}

.items-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.items-table th {
	text-align: left;
	padding: 0.75rem;
	background: var(--paper-2);
	border-bottom: 2px solid var(--rule);
	font-weight: 600;
	color: var(--ink-soft);
}

.items-table th.sortable {
	cursor: pointer;
	user-select: none;
}

.items-table th.sortable:hover {
	color: var(--accent);
}

.items-table td {
	padding: 0.75rem;
	border-bottom: 1px solid var(--rule);
	cursor: pointer;
}

.items-table tr:hover td {
	background: var(--hover);
}

.btn-edit {
	padding: 0.25rem 0.5rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 4px;
	cursor: pointer;
	font-size: 0.75rem;
}

.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 1rem;
	margin-top: 1.5rem;
	padding: 1rem;
}

.pagination button {
	padding: 0.375rem 0.75rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 4px;
	cursor: pointer;
}

.pagination button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
