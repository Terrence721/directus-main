import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../../../router.js';
import CollectionBrowser from './collection.vue';

vi.mock('../composables/use-collections-manager.js', () => ({
	useCollectionsManager: () => ({
		flatCollections: { value: [] },
		loading: { value: false },
		error: { value: null },
		fetchCollections: vi.fn().mockResolvedValue(undefined),
	}),
}));

enableAutoUnmount(afterEach);

beforeEach(async () => {
	setActivePinia(createPinia());
	await router.push('/content');
});

describe('CollectionBrowser', () => {
	it('renders without crashing when no collections are available', () => {
		const wrapper = mount(CollectionBrowser, { global: { plugins: [router] } });
		expect(wrapper.exists()).toBe(true);
	});

	it('shows a message when no collection is selected', () => {
		const wrapper = mount(CollectionBrowser, { global: { plugins: [router] } });
		expect(wrapper.text()).toContain('Select a collection');
	});
});
