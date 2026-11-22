import { ref, computed } from 'vue';
import type { CollectionInfo } from '@directus/composables';
import { resolveApiBaseUrl } from '@directus/composables';

interface CollectionNode extends CollectionInfo {
	meta?: { singleton?: boolean } | null;
	children?: CollectionNode[];
}

const collectionsCache = ref<CollectionNode[] | null>(null);
const loading = ref(false);
const error = ref<Error | null>(null);

async function fetchCollections(): Promise<CollectionNode[]> {
	if (collectionsCache.value !== null) return collectionsCache.value;

	loading.value = true;
	error.value = null;

	try {
		const baseUrl = resolveApiBaseUrl();
		const resp = await fetch(`${baseUrl}/collections`);
		if (!resp.ok) throw new Error(`Failed to load collections (${resp.status})`);
		const json = (await resp.json()) as { data: CollectionInfo[] };

		const items = json.data ?? [];
		collectionsCache.value = items.map((c) => ({ ...c }) as CollectionNode);
		return collectionsCache.value;
	} catch (err) {
		error.value = err instanceof Error ? err : new Error('Failed to load collections');
		throw err;
	} finally {
		loading.value = false;
	}
}

function getFlatNonSingletons(nodes: CollectionNode[]): CollectionNode[] {
	const result: CollectionNode[] = [];
	for (const node of nodes) {
		if (!node.meta?.singleton) result.push(node);
		if (node.children) result.push(...getFlatNonSingletons(node.children));
	}
	return result;
}

export const useCollectionsManager = () => {
	return {
		collections: computed(() => collectionsCache.value ?? []),
		flatCollections: computed(() => (collectionsCache.value ? getFlatNonSingletons(collectionsCache.value) : [])),
		loading,
		error,
		fetchCollections,
	};
};
