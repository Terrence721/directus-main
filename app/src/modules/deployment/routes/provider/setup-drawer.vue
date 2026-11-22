<script setup lang="ts">
import { ref } from 'vue';

const provider = ref<'github' | 'gitlab' | 'bitbucket'>();
const repo = ref('');
const branch = ref('main');
const autoDeploy = ref(true);

function onSubmit() {
	// Mock submission - in real Directus this would call the API
	alert(`Connecting ${provider.value}://${repo.value}@${branch.value}`);
}
</script>

<template>
	<div class="provider-setup">
		<h1>Connect Provider</h1>
		<form @submit.prevent="onSubmit">
			<div class="form-group">
				<label>Provider</label>
				<select v-model="provider" class="select" required>
					<option value="">Select provider</option>
					<option value="github">GitHub</option>
					<option value="gitlab">GitLab</option>
					<option value="bitbucket">Bitbucket</option>
				</select>
			</div>

			<div class="form-group">
				<label>Repository</label>
				<input v-model="repo" class="input" type="text" placeholder="owner/repo" required />
			</div>

			<div class="form-group">
				<label>Branch</label>
				<input v-model="branch" class="input" type="text" placeholder="main" required />
			</div>

			<div class="form-group">
				<label>
					<input v-model="autoDeploy" type="checkbox" />
					Auto-deploy on push
				</label>
			</div>

			<div class="form-actions">
				<button class="btn btn--primary" type="submit">Connect</button>
				<button class="btn" type="button">Cancel</button>
			</div>
		</form>
	</div>
</template>

<style scoped>
.provider-setup {
	padding: 2rem;
	max-inline-size: 500px;
	margin: 0 auto;
}

.select,
.input {
	inline-size: 100%;
	padding: 0.75rem;
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	font-family: inherit;
}

.select {
	min-block-size: 40px;
}

.form-group {
	margin-block-end: 1.5rem;
}

.label {
	display: block;
	margin-block-end: 0.5rem;
	font-weight: 600;
}

.form-actions {
	display: flex;
	justify-content: flex-end;
	gap: 1rem;
}

.btn--primary {
	padding: 0.75rem 1.5rem;
	border: none;
	border-radius: 0.375rem;
	font-weight: 600;
	cursor: pointer;
	background: var(--accent);
	color: var(--accent-ink);
}

.btn--primary:hover {
	background: var(--accent-hover);
}

.btn {
	flex: 1;
	padding: 0.75rem 1.5rem;
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	font-weight: 600;
	background: var(--paper-2);
	color: var(--ink);
	cursor: pointer;
}

.btn:hover {
	background: var(--paper);
	border-color: var(--accent);
}
</style>
