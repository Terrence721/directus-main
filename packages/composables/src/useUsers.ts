import { ref } from 'vue';
import { resolveApiBaseUrl } from './useServer.js';

export interface UserInfo {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	avatarUrl: string | null;
}

/**
 * Composable that fetches user data from the API.
 */
export function useUsers(accessToken?: string | null) {
	const data = ref<UserInfo[]>([]);
	const loading = ref(false);
	const error = ref<Error | null>(null);

	async function fetchUsers() {
		if (!accessToken) return;

		loading.value = true;
		error.value = null;
		try {
			const resp = await fetch(`${resolveApiBaseUrl()}/users`, {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (!resp.ok) throw new Error(`Failed to fetch users: ${resp.status}`);
			const result = (await resp.json()) as { data: UserInfo[]; meta: Record<string, unknown> };
			data.value = result.data ?? [];
		} catch (err) {
			error.value = err instanceof Error ? err : new Error('Unknown error');
			data.value = [];
		} finally {
			loading.value = false;
		}
	}

	return { data, loading, error, fetchUsers };
}
