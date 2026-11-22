<script setup lang="ts">
import { useDeploymentNavigation } from '@directus/composables';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const provider = route.params.provider as string;

const { providers, loading } = useDeploymentNavigation();

const providerConfig = computed(() => providers.value.find((p) => p.provider === provider));
</script>

<template>
	<div class="provider-dashboard">
		<h1>{{ provider }} Dashboard</h1>
		<div v-if="loading">Loading...</div>
		<div v-else>
			<p>Provider: {{ provider }}</p>
			<p>Status: {{ providerConfig?.configured ? 'Configured' : 'Not configured' }}</p>
		</div>
	</div>
</template>

<style scoped>
.provider-dashboard {
	padding: 2rem;
}
</style>
