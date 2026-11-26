<script setup lang="ts">
import { useAuth, useRouter, register, type RegisterData } from '@directus/composables';
import RegisterForm from '../components/RegisterForm.vue';
import { hydrate } from '../hydrate.js';

const { setSession } = useAuth();
const { push } = useRouter();

async function handleRegister(data: RegisterData) {
	const { session } = await register(data);
	setSession(session.accessToken, session.expiresAt);
	await hydrate();
	await push('/');
}
</script>

<template>
	<RegisterForm :on-submit="handleRegister" />
</template>
