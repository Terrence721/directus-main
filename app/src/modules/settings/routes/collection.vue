<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from '@directus/composables';
import { useUserStore } from '@directus/stores';

const auth = useAuth();
const userStore = useUserStore();
const accessToken = computed(() => auth.session?.accessToken ?? null);
const currentUser = computed(() => userStore.user);

const form = ref({ firstName: '', lastName: '', email: '' });
const saving = ref(false);
const success = ref(false);
const error = ref<Error | null>(null);

onMounted(() => {
	if (currentUser.value) {
		form.value = {
			firstName: currentUser.value.firstName ?? '',
			lastName: currentUser.value.lastName ?? '',
			email: currentUser.value.email,
		};
	}
});

async function handleSave() {
	if (!accessToken.value) return;
	saving.value = true;
	error.value = null;
	success.value = false;
	try {
		const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8055'}/users/me`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${accessToken.value}`,
			},
			body: JSON.stringify(form.value),
		});
		if (!resp.ok) throw new Error(`Failed to update profile: ${resp.status}`);
		const result = (await resp.json()) as { user: NonNullable<typeof currentUser.value> };
		userStore.setUser(result.user);
		success.value = true;
	} catch (err) {
		error.value = err instanceof Error ? err : new Error('Update failed');
	} finally {
		saving.value = false;
	}
}
</script>

<template>
	<div class="settings-view">
		<h1>Settings</h1>
		<div v-if="!currentUser" class="settings-empty">Not logged in.</div>
		<div v-else class="settings-card">
			<h2>Profile</h2>
			<p v-if="success" class="settings-success">Profile updated successfully.</p>
			<p v-else-if="error" class="settings-error">{{ error.message }}</p>

			<div class="settings-fields">
				<label>
					First name
					<input v-model="form.firstName" type="text" class="settings-input" />
				</label>
				<label>
					Last name
					<input v-model="form.lastName" type="text" class="settings-input" />
				</label>
				<label>
					Email
					<input v-model="form.email" type="email" class="settings-input" />
				</label>
			</div>

			<button class="settings-save" :disabled="saving" @click="handleSave">
				{{ saving ? 'Saving…' : 'Save changes' }}
			</button>
		</div>
	</div>
</template>

<style scoped>
.settings-view {
	max-width: 560px;
}

.settings-view h1 {
	margin: 0 0 1.5rem;
	font-size: 1.5rem;
}

.settings-empty {
	color: var(--ink-soft);
	font-size: 0.9375rem;
}

.settings-card {
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
	padding: 1.5rem;
}

.settings-card h2 {
	margin: 0 0 1rem;
	font-size: 1.125rem;
}

.settings-success {
	margin: 0 0 1rem;
	font-size: 0.875rem;
	color: #15803d;
}

.settings-error {
	margin: 0 0 1rem;
	font-size: 0.875rem;
	color: #b3261e;
}

.settings-fields {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	margin-bottom: 1.25rem;
}

.settings-fields label {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	font-size: 0.8125rem;
	color: var(--ink-soft);
}

.settings-input {
	padding: 0.375rem 0.5rem;
	font: inherit;
	font-size: 0.875rem;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	color: var(--ink);
}

.settings-input:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 1px;
}

.settings-save {
	padding: 0.5rem 1rem;
	font: inherit;
	font-size: 0.875rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
}

.settings-save:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
