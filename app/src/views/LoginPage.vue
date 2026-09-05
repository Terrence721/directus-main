<script setup lang="ts">
import { useAuthStore } from '@directus/stores';
import { useRouter } from 'vue-router';
import { login } from '../api/authClient.js';
import LoginForm from '../components/LoginForm.vue';

const auth = useAuthStore();
const router = useRouter();

async function handleLogin(credentials: { email: string; password: string }) {
	const session = await login(credentials);
	auth.setSession(session.accessToken, session.expiresAt);
	await router.push('/');
}
</script>

<template>
	<LoginForm :on-submit="handleLogin" />
</template>
