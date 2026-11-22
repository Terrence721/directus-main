<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSearch, useCollections } from '@directus/composables';

const query = ref('');
const { data: collections, fetchCollections } = useCollections();
const selectedCollections = ref<string[]>([]);
const page = ref(1);

const searchInstance = ref<ReturnType<typeof useSearch> | null>(null);

const resultCols = ['collection', 'id', 'title', 'status'];

function doSearch() {
	const q = query.value.trim();
	if (!q) return;
	searchInstance.value = useSearch(q, selectedCollections.value.length ? selectedCollections.value : [], {
		page: page.value,
		limit: 20,
	});
}

function clearSearch() {
	query.value = '';
	searchInstance.value = null;
}

onMounted(fetchCollections);
</script>

<template>
	<div class="search-view">
		<h1>Search</h1>

		<form class="search-form" @submit.prevent="doSearch">
			<input v-model="query" placeholder="Search across collections…" class="search-input" aria-label="Search query" />
			<button type="submit" :disabled="!query.trim()">Search</button>
			<button v-if="searchInstance" type="button" class="clear-btn" @click="clearSearch">Clear</button>
		</form>

		<!-- Collection filters -->
		<div v-if="collections.length > 0" class="coll-filters">
			<label v-for="coll in collections" :key="coll.collection" class="coll-filter">
				<input
					type="checkbox"
					:checked="selectedCollections.includes(coll.collection)"
					@change="
						(e) => {
							const checked = (e.target as HTMLInputElement).checked;
							if (checked) selectedCollections.push(coll.collection);
							else selectedCollections.splice(selectedCollections.indexOf(coll.collection), 1);
						}
					"
				/>
				{{ coll.label }}
			</label>
		</div>

		<div v-if="searchInstance?.loading" class="search-loading">Searching…</div>
		<div v-else-if="searchInstance?.error" class="search-error">{{ searchInstance.error.message }}</div>
		<table v-else class="search-table">
			<thead>
				<tr>
					<th>Collection</th>
					<th>Id</th>
					<th>Title</th>
					<th>Status</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="!searchInstance || searchInstance.results.length === 0">
					<td colspan="4" style="text-align: center; color: var(--ink-soft)">
						{{ query.trim() ? 'No results found.' : 'Enter a query to search.' }}
					</td>
				</tr>
				<template
					v-for="(row, idx) in searchInstance?.results ?? []"
					:key="String((row as Record<string, unknown>)['id'] ?? idx)"
				>
					<tr>
						<template v-for="col in resultCols" :key="col">
							<td>{{ row[col] ?? '-' }}</td>
						</template>
					</tr>
				</template>
			</tbody>
		</table>

		<footer v-if="searchInstance && searchInstance.total > 20" class="search-pagination">
			<button :disabled="searchInstance.page <= 1" @click="searchInstance.setPage(searchInstance.page - 1)">
				Prev
			</button>
			<span>Page {{ searchInstance.page }}</span>
			<button
				:disabled="searchInstance.page * searchInstance.limit >= (searchInstance.total ?? 0)"
				@click="searchInstance.setPage(searchInstance.page + 1)"
			>
				Next
			</button>
		</footer>
	</div>
</template>

<style scoped>
.search-view {
	max-inline-size: 900px;
}

h1 {
	margin: 0 0 1.5rem;
	font-size: 1.5rem;
}

.search-form {
	display: flex;
	gap: 0.5rem;
	margin-block-end: 1rem;
}

.search-input {
	flex: 1;
	padding: 0.625rem 0.75rem;
	font: inherit;
	font-size: 0.9375rem;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
}

.search-input:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 1px;
}

.search-form button {
	padding: 0.625rem 1.25rem;
	font: inherit;
	font-weight: 600;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
}

.search-form button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.clear-btn {
	background: var(--paper-2);
	color: var(--ink);
	border: 1px solid var(--rule);
}

.coll-filters {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-block-end: 1rem;
}

.coll-filter {
	display: flex;
	align-items: center;
	gap: 0.375rem;
	font-size: 0.875rem;
	cursor: pointer;
}

.search-loading,
.search-error {
	padding: 2rem;
	text-align: center;
	color: var(--ink-soft);
}

.search-error {
	color: #b3261e;
}

.search-table {
	inline-size: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.search-table th,
.search-table td {
	padding: 0.5rem 0.75rem;
	text-align: start;
	border-block-end: 1px solid var(--rule);
}

.search-table th {
	font-weight: 600;
	color: var(--ink-soft);
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	background: var(--paper-2);
}

.search-table tr:hover td {
	background: var(--paper-2);
}

.search-pagination {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	margin-block-start: 1rem;
	font-size: 0.875rem;
}

.search-pagination button {
	padding: 0.375rem 0.75rem;
	font: inherit;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	cursor: pointer;
}

.search-pagination button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
