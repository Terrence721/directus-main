<script setup lang="ts">
import { useDeploymentNavigation } from '@directus/composables';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const provider = route.params.provider as string;

const { loading } = useDeploymentNavigation();

const config = ref({
	name: provider,
	configured: false,
});
</script>

<template>
	<div class="provider-settings">
		<h1>{{ provider }} Settings</h1>
		<div v-if="loading">Loading...</div>
		<div v-else>
			<p>Provider: {{ provider }}</p>
			<p>Status: {{ config.configured ? 'Configured' : 'Not configured' }}</p>
		</div>
	</div>
</template>

<style scoped>
.provider-settings {
	padding: 2rem;
}
</style>
