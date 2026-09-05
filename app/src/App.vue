<script setup lang="ts">
import { useAppStore, useAuthStore } from '@directus/stores';
import { onMounted } from 'vue';
import { login } from './api/authClient.js';
import LoginForm from './components/LoginForm.vue';

const app = useAppStore();
const auth = useAuthStore();

onMounted(() => {
	app.startHydration();
	app.completeHydration();
});

async function handleLogin(credentials: { email: string; password: string }) {
	const session = await login(credentials);
	auth.setSession(session.accessToken, session.expiresAt);
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
