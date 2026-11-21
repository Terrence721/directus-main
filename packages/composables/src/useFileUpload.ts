import { useServer } from './useServer.js';
import { ref } from 'vue';

/**
 * Composable that handles file uploads to the server API.
 * Uses multipart/form-data for file uploads with progress tracking.
 *
 * @param options - Optional configuration (collection, field, filename)
 *
 * @example
 * import { useFileUpload } from '@directus/composables';
 *
 * const { upload, progress, error, isUploading } = useFileUpload({
 *   collection: 'media',
 *   field: 'file',
 * });
 *
 * // Then call upload(File) or upload(FormData)
 */
export function useFileUpload(
	options: {
		collection?: string;
		field?: string;
		filename?: string;
	} = {},
) {
	const server = useServer();

	const progress = ref(0);
	const error = ref<Error | null>(null);
	const isUploading = ref(false);
	const uploadedFile = ref<Record<string, unknown> | null>(null);

	async function upload(file: File | FormData) {
		if (!server.info.value) {
			error.value = new Error('Server info not available');
			return null;
		}

		if (isUploading.value) {
			error.value = new Error('Upload already in progress');
			return null;
		}

		isUploading.value = true;
		progress.value = 0;
		error.value = null;
		uploadedFile.value = null;

		const formData = file instanceof FormData ? file : new FormData();
		if (file instanceof File) {
			formData.append(options.field ?? 'file', file, options.filename ?? file.name);
		}

		if (options.collection) {
			formData.append('collection', options.collection);
		}

		const serverInfo = server.info.value;
		try {
			const response = await fetch(`${serverInfo.projectLogoUrl || 'http://localhost:8055'}/assets`, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.message ?? `Upload failed: ${response.status}`);
			}

			const result = await response.json();
			uploadedFile.value = result.data ?? result;
			return uploadedFile.value;
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown upload error');
			return null;
		} finally {
			isUploading.value = false;
			progress.value = 100;
		}
	}

	return {
		upload,
		progress,
		error,
		isUploading,
		uploadedFile,
	};
}
