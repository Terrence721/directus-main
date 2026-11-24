import { describe, expect, it } from 'vitest';
import { useDeploymentNavigation } from './useDeploymentNavigation';

describe('useDeploymentNavigation', () => {
	it('returns refs with default values', () => {
		const { providers, loading, fetch, refresh } = useDeploymentNavigation();

		expect(providers.value).toEqual([]);
		expect(loading.value).toBe(true);
		expect(fetch).toBeTypeOf('function');
		expect(refresh).toBeTypeOf('function');
	});

	it('fetch populates providers and sets loading to false', async () => {
		const { fetch, providers, loading } = useDeploymentNavigation();

		await fetch();

		expect(loading.value).toBe(false);
		expect(providers.value).toHaveLength(3);
		expect(providers.value).toContainEqual({ provider: 'github', name: 'GitHub', configured: false });
		expect(providers.value).toContainEqual({ provider: 'gitlab', name: 'GitLab', configured: false });
		expect(providers.value).toContainEqual({ provider: 'bitbucket', name: 'Bitbucket', configured: false });
	});

	it('refresh calls fetch', () => {
		const { refresh } = useDeploymentNavigation();

		expect(refresh).toBeTypeOf('function');
	});
});
