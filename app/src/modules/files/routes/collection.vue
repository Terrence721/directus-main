<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth, useFileUpload } from '@directus/composables';

const { session } = useAuth();
const { upload, progress, isUploading, uploadedFile, error } = useFileUpload();

const selectedFile = ref<File | null>(null);
const fileList = ref<Array<{ id: string; filename: string; mimeType: string; createdAt: number }>>([]);
const listLoading = ref(false);
const listError = ref<Error | null>(null);

async function handleDrop(e: DragEvent) {
	e.preventDefault();
	const file = e.dataTransfer?.files[0];
	if (file) await handleUpload(file);
}

async function handleFileInput(e: Event) {
	const file = (e.target as HTMLInputElement).files?.[0];
	if (file) await handleUpload(file);
}

async function handleUpload(file: File) {
	selectedFile.value = file;
	await upload(file);
	selectedFile.value = null;
	await refreshList();
}

async function refreshList() {
	listLoading.value = true;
	listError.value = null;
	try {
		const token = session?.accessToken;
		if (!token) return;
		const resp = await fetch('http://localhost:8055/files', {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!resp.ok) throw new Error(`Failed to list files: ${resp.status}`);
		const result = (await resp.json()) as {
			data: Array<{ id: string; filename: string; mimeType: string; createdAt: number }>;
		};
		fileList.value = result.data ?? [];
	} catch (err) {
		listError.value = err instanceof Error ? err : new Error('Unknown error');
		fileList.value = [];
	} finally {
		listLoading.value = false;
	}
}

onMounted(refreshList);
</script>

<template>
	<div class="files-view">
		<h1>Files</h1>

		<!-- Upload area -->
		<div class="upload-zone" @drop="handleDrop" @dragover.prevent @change="handleFileInput">
			<input id="file-input" type="file" style="display: none" @change="handleFileInput" />
			<label for="file-input" class="upload-label">
				<span class="upload-label__icon">{{ isUploading ? '⏳' : '▲' }}</span>
				{{ isUploading ? `Uploading… ${progress}%` : 'Click or drag a file to upload' }}
			</label>
		</div>

		<p v-if="isUploading" class="upload-progress">Progress: {{ progress }}%</p>
		<p v-else-if="uploadedFile" class="upload-success">Upload successful!</p>
		<p v-else-if="error" class="upload-error">{{ error.message }}</p>

		<!-- File list -->
		<div v-if="listLoading" class="files-loading">Loading files…</div>
		<div v-else-if="listError" class="files-error">{{ listError.message }}</div>
		<table v-else class="files-table">
			<thead>
				<tr>
					<th>Filename</th>
					<th>Type</th>
					<th>Uploaded</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="fileList.length === 0">
					<td colspan="3" style="text-align: center; color: var(--ink-soft)">No files yet.</td>
				</tr>
				<tr v-for="file in fileList" :key="file.id">
					<td>{{ file.filename }}</td>
					<td>{{ file.mimeType || '—' }}</td>
					<td>{{ new Date(file.createdAt).toLocaleString() }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>
.files-view {
	max-width: 800px;
}

h1 {
	margin: 0 0 1.5rem;
	font-size: 1.5rem;
}

.upload-zone {
	border: 2px dashed var(--rule);
	border-radius: 0.5rem;
	padding: 2rem;
	text-align: center;
	cursor: pointer;
	transition:
		border-color 0.15s,
		background 0.15s;
}

.upload-zone:hover,
.upload-zone:focus-within {
	border-color: var(--accent);
	background: var(--paper-2);
}

.upload-label {
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	cursor: pointer;
}

.upload-label__icon {
	font-size: 2rem;
}

.upload-progress,
.upload-success,
.upload-error {
	margin-top: 0.75rem;
	font-size: 0.875rem;
}

.upload-success {
	color: var(--accent);
}
.upload-error {
	color: #b3261e;
}

.files-loading,
.files-error {
	padding: 1.5rem;
	text-align: center;
	color: var(--ink-soft);
}

.files-error {
	color: #b3261e;
}

.files-table {
	width: 100%;
	margin-top: 1rem;
	border-collapse: collapse;
	font-size: 0.875rem;
}

.files-table th,
.files-table td {
	padding: 0.5rem 0.75rem;
	text-align: start;
	border-bottom: 1px solid var(--rule);
}

.files-table th {
	font-weight: 600;
	color: var(--ink-soft);
	font-size: 0.75rem;
	text-transform: uppercase;
	letter-spacing: 0.04em;
	background: var(--paper-2);
}
</style>
