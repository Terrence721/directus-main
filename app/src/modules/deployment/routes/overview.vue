<script setup lang="ts">
import { useDeploymentNavigation } from '@directus/composables';
import { ref, computed } from 'vue';

const { providers, loading } = useDeploymentNavigation();

const providersList = computed(() =>
	providers.value.map((p) => ({
		type: p.provider,
		configured: p.configured,
	})),
);

const selectedProvider = ref<string | null>(null);
</script>

<template>
	<div class="deployment-overview">
		<h1>Deployments</h1>
		<p>Connect a provider to get started.</p>
		<button class="btn" @click="selectedProvider = 'github'">Add Provider</button>

		<div v-if="loading" class="loading">Loading...</div>
		<div v-else class="providers-list">
			<div v-for="provider in providersList" :key="provider.type" class="provider-item">
				<div class="provider-name">{{ provider.type }}</div>
				<span :class="['status', provider.configured ? 'configured' : 'unconfigured']">
					{{ provider.configured ? 'Configured' : 'Not configured' }}
				</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
.deployment-overview {
	padding: 2rem;
}

.btn {
	padding: 0.75rem 1.5rem;
	background: var(--accent);
	color: var(--accent-ink);
	border: none;
	border-radius: 0.375rem;
	font-weight: 600;
	cursor: pointer;
	margin-block-end: 1.5rem;
}

.loading {
	text-align: center;
	padding: 3rem;
	color: var(--ink-soft);
}

.providers-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: 1rem;
}

.provider-item {
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	padding: 1rem;
}

.provider-name {
	font-weight: 600;
	margin-block-end: 0.5rem;
}

.status {
	display: inline-block;
	font-size: 0.75rem;
	padding: 0.25rem 0.5rem;
	border-radius: 0.25rem;
}

.status.configured {
	background: var(--success-2);
	color: var(--success-ink);
}

.status.unconfigured {
	background: var(--warning-2);
	color: var(--warning-ink);
}
</style>
