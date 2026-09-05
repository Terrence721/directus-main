<script setup lang="ts">
import { useAppStore, useAuthStore } from '@directus/stores';
import { onMounted } from 'vue';
import LoginForm from './components/LoginForm.vue';

const app = useAppStore();
const auth = useAuthStore();

onMounted(() => {
	app.startHydration();
	app.completeHydration();
});

async function handleLogin(credentials: { email: string; password: string }) {
	// Stub until a real API client exists (see todo.md) — accepts any credentials.
	auth.setSession(`stub-${credentials.email}`, Date.now() + 60 * 60 * 1000);
}
</script>

<template>
	<main>
		<p v-if="app.hydrating">Loading…</p>
		<p v-else-if="app.hydrationError">Something went wrong.</p>
		<p v-else-if="auth.loggedIn">Welcome back.</p>
		<LoginForm v-else :on-submit="handleLogin" />
	</main>
</template>
