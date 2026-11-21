<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuth, resolveApiBaseUrl } from '@directus/composables';
import { useUserStore } from '@directus/stores';

interface UserInfo {
	id: string;
	firstName?: string | null;
	lastName?: string | null;
	email: string;
}

const auth = useAuth();
const userStore = useUserStore();
const accessToken = computed(() => auth.session?.accessToken ?? null);

const users = ref<UserInfo[]>([]);
const loading = ref(false);
const error = ref<Error | null>(null);

async function fetchUsers() {
	const token = accessToken.value;
	if (!token) return;

	loading.value = true;
	error.value = null;
	try {
		const apiUrl = resolveApiBaseUrl();
		const response = await fetch(`${apiUrl}/users`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!response.ok) throw new Error(`Failed to load users (${response.status})`);
		const result = (await response.json()) as { data: Array<{ id: string; firstName?: string | null; lastName?: string | null; email: string }> };
		users.value = result.data.map((u) => ({
			id: u.id,
			firstName: u.firstName ?? null,
			lastName: u.lastName ?? null,
			email: u.email,
		}));
	} catch (err) {
		error.value = err instanceof Error ? err : new Error('Failed to load users');
	} finally {
		loading.value = false;
	}
}

watch(
	() => accessToken.value,
	(token) => { if (token) fetchUsers(); }
);

onMounted(() => { if (accessToken.value) fetchUsers(); });

// Edit state
const editingUserId = ref<string | null>(null);
const editForm = ref<Record<string, unknown>>({});
const editError = ref<Error | null>(null);
const saving = ref(false);

function startEdit(row: UserInfo) {
	editingUserId.value = row.id;
	editForm.value = { firstName: row.firstName ?? '', lastName: row.lastName ?? '', email: row.email };
	editError.value = null;
}

function cancelEdit() {
	editingUserId.value = null;
	editForm.value = {};
	editError.value = null;
}

async function handleSave() {
	const token = accessToken.value;
	if (!editingUserId.value || !token) return;
	saving.value = true;
	editError.value = null;
	try {
		const resp = await fetch(`${resolveApiBaseUrl()}/users/me`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
			body: JSON.stringify(editForm.value),
		});
		if (!resp.ok) throw new Error(`Update failed (${resp.status})`);
		const result = (await resp.json()) as { user: UserInfo & { avatarUrl?: string | null } };
		userStore.setUser({ ...result.user, firstName: result.user.firstName ?? null, lastName: result.user.lastName ?? null, avatarUrl: result.user.avatarUrl ?? '' });
		cancelEdit();
		await fetchUsers();
	} catch (err) {
		editError.value = err instanceof Error ? err : new Error('Update failed');
	} finally {
		saving.value = false;
	}
}

function rowKey(row: UserInfo, index: number): string {
	return row.id ?? `index:${index}`;
}
</script>

<template>
	<div class="users-view">
		<header class="users-header">
			<h1>Users</h1>
			<p v-if="loading" class="users-loading">Loading…</p>
			<p v-else-if="error" class="users-error">{{ error.message }}</p>
		</header>

		<table v-if="!loading && !error" class="users-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="users.length === 0">
					<td colspan="3" style="text-align: center; color: var(--ink-soft)">No users found.</td>
				</tr>
				<tr
					v-for="(user, index) in users"
					:key="rowKey(user, index)"
					:class="{ 'users-table--editing': editingUserId === user.id }"
				>
					<td v-if="editingUserId !== user.id">
						{{ [user.firstName, user.lastName].filter(Boolean).join(' ') || '—' }}
					</td>
					<td v-if="editingUserId !== user.id">{{ user.email }}</td>
					<td v-if="editingUserId !== user.id">
						<button class="users-action-btn" @click="startEdit(user)">Edit</button>
					</td>

					<!-- Inline edit form -->
					<td v-if="editingUserId === user.id" colspan="3" class="users-edit-cell">
						<div class="users-edit-form">
							<div class="users-edit-form__fields">
								<label>
									First name
									<input v-model="editForm.firstName" type="text" class="users-input" />
								</label>
								<label>
									Last name
									<input v-model="editForm.lastName" type="text" class="users-input" />
								</label>
								<label>
									Email
									<input v-model="editForm.email" type="email" class="users-input" />
								</label>
							</div>
							<p v-if="editError" class="users-edit-form__error">{{ editError.message }}</p>
							<div class="users-edit-form__actions">
								<button class="users-btn users-btn--primary" :disabled="saving" @click="handleSave">
									{{ saving ? 'Saving…' : 'Save' }}
								</button>
								<button class="users-btn" @click="cancelEdit">Cancel</button>
							</div>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
.users-view {
	max-width: 800px;
}

.users-header {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin-bottom: 1.5rem;
}

.users-header h1 {
	margin: 0;
	font-size: 1.5rem;
}

.users-loading,
.users-error {
	font-size: 0.875rem;
	color: var(--ink-soft);
}

.users-error {
	color: #b3261e;
}

.users-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.users-table th,
.users-table td {
	padding: 0.625rem 0.75rem;
	text-align: start;
	border-bottom: 1px solid var(--rule);
}

.users-table th {
	font-weight: 600;
	color: var(--ink-soft);
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	background: var(--paper-2);
}

.users-table tr:hover td {
	background: var(--paper-2);
}

.users-table--editing td {
	background: var(--paper-3);
}

.users-action-btn {
	padding: 0.25rem 0.625rem;
	font: inherit;
	font-size: 0.8125rem;
	background: transparent;
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
	cursor: pointer;
}

.users-action-btn:hover {
	background: var(--paper-2);
}

.users-edit-cell {
	padding: 0;
}

.users-edit-form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1rem 0.75rem;
}

.users-edit-form__fields {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}

.users-edit-form label {
	display: flex;
	flex-direction: column;
	gap: 0.25rem;
	font-size: 0.8125rem;
	color: var(--ink-soft);
}

.users-input {
	padding: 0.375rem 0.5rem;
	font: inherit;
	font-size: 0.875rem;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
}

.users-input:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 1px;
}

.users-edit-form__error {
	font-size: 0.8125rem;
	color: #b3261e;
	margin: 0;
}

.users-edit-form__actions {
	display: flex;
	gap: 0.5rem;
}

.users-btn {
	padding: 0.375rem 0.75rem;
	font: inherit;
	font-size: 0.8125rem;
	border-radius: 0.375rem;
	cursor: pointer;
	border: none;
}

.users-btn--primary {
	background: var(--accent);
	color: var(--accent-ink);
}

.users-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
