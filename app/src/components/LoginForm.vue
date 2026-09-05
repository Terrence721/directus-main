<script setup lang="ts">
import { isDirectusError } from '@directus/errors';
import { ref } from 'vue';

export interface LoginCredentials {
	email: string;
	password: string;
}

const props = defineProps<{
	onSubmit: (credentials: LoginCredentials) => Promise<void>;
}>();

const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

async function handleSubmit() {
	if (submitting.value) return;

	submitting.value = true;
	errorMessage.value = null;

	try {
		await props.onSubmit({ email: email.value, password: password.value });
	} catch (error) {
		errorMessage.value = isDirectusError(error) ? error.message : 'Something went wrong. Please try again.';
	} finally {
		submitting.value = false;
	}
}
</script>

<template>
	<form @submit.prevent="handleSubmit">
		<label>
			Email
			<input v-model="email" type="email" autocomplete="username" required />
		</label>
		<label>
			Password
			<input v-model="password" type="password" autocomplete="current-password" required />
		</label>
		<p v-if="errorMessage" role="alert">{{ errorMessage }}</p>
		<button type="submit" :disabled="submitting">{{ submitting ? 'Signing in…' : 'Sign in' }}</button>
	</form>
</template>

<style scoped>
form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	inline-size: 100%;
	max-inline-size: 24rem;
	padding: 2rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.5rem;
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
