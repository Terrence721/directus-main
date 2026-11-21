import { ref } from 'vue';
import { resolveApiBaseUrl } from './useServer.js';

export interface CollectionField {
	name: string;
	type: 'string' | 'number' | 'boolean' | 'datetime';
}

export interface CollectionInfo {
	collection: string;
	label: string;
	fields: CollectionField[];
	sampleCount: number;
}

/**
 * Composable that fetches available collections from the server API.
 */
export function useCollections() {
	const data = ref<CollectionInfo[]>([]);
	const loading = ref(false);
	const error = ref<Error | null>(null);

	async function fetchCollections() {
		loading.value = true;
		error.value = null;
		try {
			const resp = await fetch(`${resolveApiBaseUrl()}/collections`);
			if (!resp.ok) throw new Error(`Failed to fetch collections: ${resp.status}`);
			const result = await resp.json() as { data: CollectionInfo[] };
			data.value = result.data ?? [];
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			data.value = [];
		} finally {
			loading.value = false;
		}
	}

	function getCollection(name: string): CollectionInfo | undefined {
		return data.value.find((c) => c.collection === name);
	}

	return { data, loading, error, fetchCollections, getCollection };
}
