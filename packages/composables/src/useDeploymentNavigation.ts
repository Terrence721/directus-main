import { ref } from 'vue';

export interface ProviderConfig {
	provider: string;
	name: string;
	configured: boolean;
}

const providers = ref<ProviderConfig[]>([]);
const loading = ref(true);

export function useDeploymentNavigation() {
	async function fetch(): Promise<void> {
		loading.value = true;
		await new Promise((resolve) => setTimeout(resolve, 50));
		providers.value = [
			{ provider: 'github', name: 'GitHub', configured: false },
			{ provider: 'gitlab', name: 'GitLab', configured: false },
			{ provider: 'bitbucket', name: 'Bitbucket', configured: false },
		];
		loading.value = false;
	}

	function refresh(): void {
		fetch();
	}

	return { providers, loading, fetch, refresh };
}
