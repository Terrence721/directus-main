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
		<div v-else-if="auth.loggedIn" class="session">
			<p>Welcome back.</p>
			<button type="button" @click="auth.clearSession()">Log out</button>
		</div>
		<LoginForm v-else :on-submit="handleLogin" />
	</main>
</template>

<style scoped>
main {
	display: flex;
	align-items: center;
	justify-content: center;
	block-size: 100vh;
	padding: 1.5rem;
}

p {
	font-size: 1.125rem;
	color: var(--ink-soft);
}

.session {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}

.session button {
	padding: 0.625rem 1.25rem;
	font: inherit;
	font-weight: 600;
	color: var(--accent);
	background: transparent;
	border: 1px solid var(--accent);
	border-radius: 0.375rem;
	cursor: pointer;
}
</style>
