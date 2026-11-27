import type { ServerInfo } from '@directus/stores';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8055';

/**
 * Fetches server configuration from api/. In local dev (`MODE === 'development'`) this hits
 * the real Express server; when `VITE_API_BASE_URL` is set (e.g. a production deploy) it hits
 * that backend; otherwise a simulated response is returned so the deployed app stays navigable.
 */
export async function fetchServerInfo(): Promise<ServerInfo> {
	if (import.meta.env.MODE === 'development' || import.meta.env.VITE_API_BASE_URL) {
		return fetchServerInfoReal();
	}

	return fetchServerInfoSimulated();
}

async function fetchServerInfoReal(): Promise<ServerInfo> {
	const response = await fetch(`${API_URL}/server/info`);

	if (!response.ok) {
		throw new Error(`Failed to fetch server info: ${response.status}`);
	}

	return response.json() as Promise<ServerInfo>;
}

function fetchServerInfoSimulated(): Promise<ServerInfo> {
	return Promise.resolve({
		projectName: 'Directus Main Demo',
		projectLogoUrl: null,
		projectColor: '#563acc',
		authProviders: [
			{ name: 'Email / Password', driver: 'local' },
			{ name: 'Google', driver: 'oauth2' },
			{ name: 'GitHub', driver: 'oauth2' },
		],
		registrationEnabled: true,
	});
}
