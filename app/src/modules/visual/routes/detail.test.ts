import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();

const mockData = ref<Record<string, unknown>[]>([]);
const mockError = ref<Error | null>(null);
const mockLoading = ref(false);
const mockRefresh = vi.fn();
const mockDeleteItem = vi.fn();

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useItems: () => ({
			data: mockData,
			error: mockError,
			loading: mockLoading,
			refresh: mockRefresh,
			deleteItem: mockDeleteItem,
		}),
	};
});

vi.mock('vue-router', () => ({
	useRoute: () => ({
		params: { collection: 'posts', id: '123' },
	}),
	useRouter: () => ({ push: routerPushSpy }),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockData.value = [];
	mockError.value = null;
	mockLoading.value = false;
	routerPushSpy.mockClear();
	mockDeleteItem.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importVisualDetail(): Promise<(typeof import('./detail.vue'))['default']> {
	return (await import('./detail.vue')).default;
}

describe('VisualDetail', () => {
	it('mounts without crashing', async () => {
		const VisualDetail = await importVisualDetail();
		const wrapper = mount(VisualDetail);
		expect(wrapper.exists()).toBe(true);
	});

	it('shows loading state when item is loading', async () => {
		const VisualDetail = await importVisualDetail();
		mockLoading.value = true;
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.loading').text()).toBe('Loading item...');
	});

	it('shows error state when item fails to load', async () => {
		const VisualDetail = await importVisualDetail();
		mockError.value = new Error('Failed to fetch item');
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.error p').text()).toBe('Failed to fetch item');
		expect(wrapper.find('.error button').text()).toBe('Retry');
	});

	it('shows empty state when item is not found', async () => {
		const VisualDetail = await importVisualDetail();
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty').text()).toBe('Item not found');
	});

	it('renders item detail fields', async () => {
		const VisualDetail = await importVisualDetail();
		mockData.value = [
			{
				id: '123',
				title: 'My Post',
				status: 'published',
				tags: ['alpha', 'beta'],
				created_at: '2026-11-01T00:00:00Z',
			},
		];
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		const rows = wrapper.findAll('.field-row');
		expect(rows).toHaveLength(5);

		const labels = wrapper.findAll('.field-label').map((el) => el.text());
		expect(labels).toEqual(['id', 'title', 'status', 'tags', 'created_at']);

		const statusValue = rows[2].find('.field-value');
		expect(statusValue.find('strong').text()).toBe('published');

		const tagsValue = rows[3].find('.field-value');
		expect(tagsValue.text()).toBe('alpha, beta');
	});

	it('navigates back when Back button is clicked', async () => {
		const VisualDetail = await importVisualDetail();
		const wrapper = mount(VisualDetail);

		const buttons = wrapper.findAll('.header__actions .btn');
		expect(buttons).toHaveLength(3);

		await buttons[0].trigger('click');
		expect(routerPushSpy).toHaveBeenCalledWith({ name: 'visual-overview', params: { collection: 'posts' } });
	});

	it('navigates to edit when Edit button is clicked', async () => {
		const VisualDetail = await importVisualDetail();
		const wrapper = mount(VisualDetail);

		const editButton = wrapper.find('.btn--primary');
		await editButton.trigger('click');

		expect(routerPushSpy).toHaveBeenCalledWith({
			name: 'visual-item',
			params: { collection: 'posts', id: '123' },
			query: { edit: 'true' },
		});
	});

	it('deletes item when confirmed and navigates back', async () => {
		const VisualDetail = await importVisualDetail();
		const confirmSpy = vi.fn(() => true);
		vi.stubGlobal('confirm', confirmSpy);
		mockDeleteItem.mockResolvedValue(undefined);
		const wrapper = mount(VisualDetail);

		const buttons = wrapper.findAll('.header__actions .btn');
		await buttons[2].trigger('click');
		await wrapper.vm.$nextTick();

		expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to delete this item?');
		expect(mockDeleteItem).toHaveBeenCalledWith('123');
		expect(routerPushSpy).toHaveBeenCalledWith({ name: 'visual-overview', params: { collection: 'posts' } });
	});

	it('does not delete item when confirm returns false', async () => {
		const VisualDetail = await importVisualDetail();
		const confirmSpy = vi.fn(() => false);
		vi.stubGlobal('confirm', confirmSpy);
		const wrapper = mount(VisualDetail);

		const buttons = wrapper.findAll('.header__actions .btn');
		await buttons[2].trigger('click');
		await wrapper.vm.$nextTick();

		expect(mockDeleteItem).not.toHaveBeenCalled();
		expect(routerPushSpy).not.toHaveBeenCalled();
	});
});
