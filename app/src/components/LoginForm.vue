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
