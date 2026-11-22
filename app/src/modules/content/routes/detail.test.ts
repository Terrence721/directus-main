import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { router } from '../../../router.js';
import ItemDetail from './detail.vue';

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		resolveApiBaseUrl: () => 'http://localhost:8055',
	};
});

enableAutoUnmount(afterEach);

beforeEach(async () => {
	setActivePinia(createPinia());
	await router.push('/content/demo_items/1');
});

describe('ItemDetail', () => {
	it('renders without crashing', () => {
		const wrapper = mount(ItemDetail, { global: { plugins: [router] } });
		expect(wrapper.exists()).toBe(true);
	});
});
