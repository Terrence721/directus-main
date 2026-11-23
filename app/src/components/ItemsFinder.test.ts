import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ItemsFinder from './ItemsFinder.vue';

const { useItems } = vi.hoisted(() => ({
	useItems: vi.fn(),
}));

vi.mock('@directus/composables', () => ({
	useItems,
}));

describe('ItemsFinder', () => {
	it('renders without throwing when mounted with valid props', () => {
		useItems.mockReturnValue({
			data: ref([{ id: '1', name: 'test' }]),
			loading: ref(false),
			error: ref(null),
			refresh: vi.fn(),
		});

		expect(() => {
			mount(ItemsFinder, {
				props: { collection: 'test-collection', itemId: '1' },
			});
		}).not.toThrow();
	});

	it('calls refresh when component mounts', async () => {
		const refreshMock = vi.fn();
		useItems.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(null),
			refresh: refreshMock,
		});

		mount(ItemsFinder, {
			props: { collection: 'test-collection', itemId: '1' },
		});

		await vi.waitFor(() => {
			expect(refreshMock).toHaveBeenCalledTimes(1);
		});
	});

	it('calls refresh when collection prop changes', async () => {
		const refreshMock = vi.fn();
		useItems.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(null),
			refresh: refreshMock,
		});

		const wrapper = mount(ItemsFinder, {
			props: { collection: 'test-collection', itemId: '1' },
		});

		await wrapper.setProps({ collection: 'new-collection' });
		await vi.waitFor(() => {
			expect(refreshMock).toHaveBeenCalled();
		});
	});
});
