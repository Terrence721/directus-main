<script setup lang="ts">
import { useAppStore, useServerStore } from '@directus/stores';
import { onMounted } from 'vue';
import { fetchServerInfo } from '@directus/composables';

const app = useAppStore();
const server = useServerStore();

onMounted(async () => {
	app.startHydration();
	try {
		server.setInfo(await fetchServerInfo());
	} catch {
		// Server info fetch failure is non-fatal — hydration continues without branding.
	}
	app.completeHydration();
});
</script>

<template>
	<main>
		<p v-if="app.hydrating">Loading…</p>
		<p v-else-if="app.hydrationError">Something went wrong.</p>
		<RouterView v-else />
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
</style>
