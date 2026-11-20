<script setup lang="ts">
import { useAuth, useRouter, login, type LoginCredentials } from '@directus/composables';
import LoginForm from '../components/LoginForm.vue';

const { setSession } = useAuth();
const { push } = useRouter();

async function handleLogin(credentials: LoginCredentials) {
	const session = await login(credentials);
	setSession(session.accessToken, session.expiresAt);
	await push('/');
}

function goToRegister() {
	push('/register');
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
