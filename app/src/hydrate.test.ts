import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAppStore, useAuthStore } from '@directus/stores';
import { hydrate, projectName } from './hydrate.js';

// Mock composables like App.test.ts does — spread actual module, override selectively
vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		fetchServerInfo: vi.fn(),
	};
});

import * as composables from '@directus/composables';

beforeEach(() => {
	setActivePinia(createPinia());
	vi.clearAllMocks();
});

describe('hydrate', () => {
	it('marks complete when the server returns info', async () => {
		const info = { projectName: 'Demo', projectLogoUrl: null, projectColor: '#563acc', authProviders: [], registrationEnabled: true };
		vi.mocked(composables.fetchServerInfo).mockResolvedValue(info);

		useAuthStore().setSession('token', Date.now() + 60_000);
		const ok = await hydrate();

		expect(ok).toBe(true);
		expect(useAppStore().hydrated).toBe(true);
		expect(useAppStore().hydrating).toBe(false);
		expect(useAppStore().hydrationError).toBeNull();
		expect(projectName.value).toBe('Demo');
	});

	it('fails gracefully when the server is unreachable', async () => {
		vi.mocked(composables.fetchServerInfo).mockRejectedValue(new Error('network down'));

		useAuthStore().setSession('token', Date.now() + 60_000);
		const ok = await hydrate();

		expect(ok).toBe(false);
		expect(useAppStore().hydrated).toBe(false);
		expect(useAppStore().hydrationError).not.toBeNull();
		expect((useAppStore().hydrationError as Error | null)?.message).toContain('network down');
	});

	it('completes immediately for unauthenticated visitors', async () => {
		const ok = await hydrate();
		expect(ok).toBe(true);
		expect(useAppStore().hydrated).toBe(true);
		expect(composables.fetchServerInfo).not.toHaveBeenCalled();
	});
});
