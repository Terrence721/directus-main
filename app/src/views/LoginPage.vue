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
</script>

<template>
	<LoginForm :on-submit="handleLogin" />
</template>
