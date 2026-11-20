<script setup lang="ts">
import { useAuthStore } from '@directus/stores';
import { useRouter } from 'vue-router';
import { login, type LoginCredentials } from '../api/authClient.js';
import LoginForm from '../components/LoginForm.vue';

const auth = useAuthStore();
const router = useRouter();

async function handleLogin(credentials: LoginCredentials) {
	const session = await login(credentials);
	auth.setSession(session.accessToken, session.expiresAt);
	await router.push('/');
}

function goToRegister() {
	router.push('/register');
}
</script>

<template>
	<div>
		<LoginForm :on-submit="handleLogin" />
		<p class="link" @click="goToRegister">No account? Create one</p>
	</div>
</template>

<style scoped>
.link {
	margin-top: 1rem;
	text-align: center;
	font-size: 0.875rem;
	color: var(--ink-soft);
	cursor: pointer;
}

.link:hover {
	color: var(--accent);
	text-decoration: underline;
}
</style>
