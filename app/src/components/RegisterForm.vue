<script setup lang="ts">
import { isDirectusError } from '@directus/errors';
import { ref } from 'vue';
import type { RegisterData } from '@directus/composables';

const props = defineProps<{
	onSubmit: (data: RegisterData) => Promise<void>;
}>();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const firstName = ref('');
const lastName = ref('');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

function validate(): boolean {
	if (password.value !== confirmPassword.value) {
		errorMessage.value = 'Passwords do not match.';
		return false;
	}
	if (password.value.length < 6) {
		errorMessage.value = 'Password must be at least 6 characters.';
		return false;
	}
	errorMessage.value = null;
	return true;
}

async function handleSubmit() {
	if (submitting.value) return;
	if (!validate()) return;

	submitting.value = true;
	try {
		await props.onSubmit({
			email: email.value,
			password: password.value,
			firstName: firstName.value || undefined,
			lastName: lastName.value || undefined,
		});
	} catch (error) {
		errorMessage.value = isDirectusError(error) ? error.message : 'Registration failed. Please try again.';
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<form @submit.prevent="handleSubmit">
		<h2>Create account</h2>

		<label>
			Email
			<input v-model="email" type="email" autocomplete="username" required />
		</label>

		<div style="display: flex; gap: 1rem">
			<label style="flex: 1">
				First name
				<input v-model="firstName" type="text" autocomplete="given-name" />
			</label>
			<label style="flex: 1">
				Last name
				<input v-model="lastName" type="text" autocomplete="family-name" />
			</label>
		</div>

		<label>
			Password
			<input v-model="password" type="password" autocomplete="new-password" required minlength="6" />
		</label>

		<label>
			Confirm password
			<input v-model="confirmPassword" type="password" autocomplete="new-password" required />
		</label>

		<p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
		<button type="submit" :disabled="submitting">
			{{ submitting ? 'Creating account…' : 'Create account' }}
		</button>
	</form>
</template>

<style scoped>
form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	inline-size: 100%;
	max-inline-size: 28rem;
	padding: 2rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
}

h2 {
	margin: 0 0 0.5rem;
	font-size: 1.25rem;
	color: var(--ink);
}

label {
	display: flex;
	flex-direction: column;
	gap: 0.375rem;
	font-size: 0.875rem;
	color: var(--ink-soft);
}

input {
	padding: 0.625rem 0.75rem;
	font: inherit;
	color: var(--ink);
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
}

input:focus-visible {
	outline: 2px solid var(--accent);
	outline-offset: 1px;
}

button {
	padding: 0.625rem 1rem;
	font: inherit;
	font-weight: 600;
	color: var(--accent-ink);
	background: var(--accent);
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
}

button:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}

[role='alert'] {
	margin: 0;
	font-size: 0.875rem;
	color: #b3261e;
}
</style>
