<script setup lang="ts">
import { useAuthStore } from '@directus/stores';
import { useRouter } from 'vue-router';
import { register } from '../api/registerClient.js';
import type { RegisterData } from '../api/registerClient.js';
import RegisterForm from '../components/RegisterForm.vue';

const auth = useAuthStore();
const router = useRouter();

async function handleRegister(data: RegisterData) {
	const { session } = await register(data);
	auth.setSession(session.accessToken, session.expiresAt);
	await router.push('/');
}
</script>

<template>
	<RegisterForm :on-submit="handleRegister" />
</template>
