<script setup lang="ts">
import { useAuthStore } from '@directus/stores';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
	auth.clearSession();
	await router.push('/login');
}
</script>

<template>
	<div class="session">
		<p>Welcome back.</p>
		<button type="button" @click="handleLogout">Log out</button>
	</div>
</template>

<style scoped>
.session {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}

p {
	font-size: 1.125rem;
	color: var(--ink-soft);
}

button {
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
