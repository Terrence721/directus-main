<script setup lang="ts">
import { useAppStore, useAuthStore } from '@directus/stores';
import { onMounted } from 'vue';

const app = useAppStore();
const auth = useAuthStore();

onMounted(() => {
	app.startHydration();
	app.completeHydration();
});
</script>

<template>
	<main>
		<p v-if="app.hydrating">Loading…</p>
		<p v-else-if="app.hydrationError">Something went wrong.</p>
		<p v-else-if="auth.loggedIn">Welcome back.</p>
		<p v-else>Please log in.</p>
	</main>
</template>
