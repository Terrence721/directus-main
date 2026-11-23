import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchServerInfo } from './serverClient';

describe('serverClient', () => {
	// Mock environment variables
	const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
	const originalEnv = { ...env };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv('MODE', 'development');
	});

	afterEach(() => {
		vi.restoreAllMocks();
		// cspell:ignore unstub
		vi.unstubAllGlobals();
		// Restore original env
		for (const key in env) {
			delete env[key];
		}
		for (const key in originalEnv) {
			env[key] = originalEnv[key];
		}
	});

	describe('fetchServerInfo', () => {
		it('fetches server info from the API in development mode', async () => {
			const mockServerInfo = {
				projectName: 'Test Project',
				projectLogoUrl: 'http://test.example.com/logo.png',
				projectColor: '#FF0000',
				authProviders: [],
				registrationEnabled: false,
			};
			const fetchMock = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => mockServerInfo,
			});
			vi.stubGlobal('fetch', fetchMock);

			const result = await fetchServerInfo();

			expect(fetchMock).toHaveBeenCalledOnce();
			expect(fetchMock).toHaveBeenCalledWith('http://localhost:8055/server/info');
			expect(result).toEqual(mockServerInfo);
		});

		it('returns simulated server info', async () => {
			vi.stubEnv('MODE', 'production');

			const result = await fetchServerInfo();

			expect(result).toEqual({
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
		});
	});
});
