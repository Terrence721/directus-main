import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useServerStore } from './server.js';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('useServerStore', () => {
	it('starts with no info', () => {
		const store = useServerStore();

		expect(store.info).toBeNull();
		expect(store.hasCustomBranding).toBe(false);
		expect(store.ssoProviders).toEqual([]);
	});

	it('reports no custom branding when logo and color are both unset', () => {
		const store = useServerStore();

		store.setInfo({
			projectName: 'My Project',
			projectLogoUrl: null,
			projectColor: null,
			authProviders: [],
			registrationEnabled: false,
		});

		expect(store.hasCustomBranding).toBe(false);
	});

	it('reports custom branding when either a logo or a color is set', () => {
		const store = useServerStore();

		store.setInfo({
			projectName: 'My Project',
			projectLogoUrl: 'https://example.com/logo.png',
			projectColor: null,
			authProviders: [],
			registrationEnabled: false,
		});

		expect(store.hasCustomBranding).toBe(true);
	});

	it('filters out the local driver from ssoProviders', () => {
		const store = useServerStore();

		store.setInfo({
			projectName: 'My Project',
			projectLogoUrl: null,
			projectColor: null,
			authProviders: [
				{ name: 'Local', driver: 'local' },
				{ name: 'GitHub', driver: 'oauth2' },
				{ name: 'Okta', driver: 'saml' },
			],
			registrationEnabled: false,
		});

		expect(store.ssoProviders).toEqual([
			{ name: 'GitHub', driver: 'oauth2' },
			{ name: 'Okta', driver: 'saml' },
		]);
	});

	it('clears info', () => {
		const store = useServerStore();

		store.setInfo({
			projectName: 'My Project',
			projectLogoUrl: null,
			projectColor: null,
			authProviders: [],
			registrationEnabled: false,
		});

		store.clearInfo();

		expect(store.info).toBeNull();
	});
});
