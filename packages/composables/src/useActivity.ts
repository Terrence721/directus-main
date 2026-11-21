import { ref } from 'vue';
import { resolveApiBaseUrl } from './useServer.js';

export interface ActivityEntry {
	id: string;
	action: string;
	collection?: string | null;
	recordId?: string | null;
	userEmail: string;
	createdAt: number;
}

/** Composable for fetching and logging activity entries via the API. */
export function useActivity(accessToken?: string | null) {
	const data = ref<ActivityEntry[]>([]);
	const loading = ref(false);
	const error = ref<Error | null>(null);

	async function fetchActivity(page = 1) {
		if (!accessToken) return;
		loading.value = true;
		error.value = null;
		try {
			const resp = await fetch(`${resolveApiBaseUrl()}/activity?page=${page}&limit=50`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (!resp.ok) throw new Error(`Failed to load activity: ${resp.status}`);
			const result = (await resp.json()) as { data: ActivityEntry[] };
			data.value = result.data ?? [];
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Failed to load activity');
			data.value = [];
		} finally {
			loading.value = false;
		}
	}

	async function logActivity(action: string, collection?: string, recordId?: string) {
		if (!accessToken) return;
		try {
			await fetch(`${resolveApiBaseUrl()}/activity`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken}`,
				},
				body: JSON.stringify({ action, collection, recordId }),
			});
			// Refresh to include the new entry
			await fetchActivity();
		} catch {
			// Silently ignore — activity logging shouldn't break the UI
		}
	}

	return { data, loading, error, fetchActivity, logActivity };
}
