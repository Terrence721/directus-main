import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, reactive } from 'vue';

const routerPushSpy = vi.fn();
const mockParams = reactive<Record<string, string>>({ collection: 'posts', id: '123' });

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
	useRoute: () => ({ params: mockParams }),
	useRouter: () => ({ push: routerPushSpy }),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	Object.assign(mockParams, { collection: 'posts', id: '123' });
	mockData.value = [];
	mockError.value = null;
	mockLoading.value = false;
	routerPushSpy.mockClear();
	mockRefresh.mockClear();
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

	it('shows error state and refreshes on retry', async () => {
		const VisualDetail = await importVisualDetail();
		mockError.value = new Error('Failed to fetch item');
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.error p').text()).toBe('Failed to fetch item');

		// Retry button triggers store.refresh
		await wrapper.find('.error button').trigger('click');
		await wrapper.vm.$nextTick();
		expect(mockRefresh).toHaveBeenCalledTimes(1);
	});

	it('shows empty state when item is not found', async () => {
		const VisualDetail = await importVisualDetail();
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty').text()).toBe('Item not found');
	});

	it('refreshes when route params change', async () => {
		const VisualDetail = await importVisualDetail();
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();
		const callsBefore = mockRefresh.mock.calls.length;

		// The params watch fires on any params mutation
		mockParams.collection = 'photos';
		await wrapper.vm.$nextTick();

		expect(mockRefresh.mock.calls.length).toBeGreaterThan(callsBefore);
	});

	it('renders item detail fields with type-specific formatting', async () => {
		const VisualDetail = await importVisualDetail();
		mockData.value = [
			{
				id: '123',
				title: 'My Post',
				status: 'published',
				position: 4,
				tags: ['alpha', 'beta'],
				created_at: '2026-11-01T00:00:00Z',
				updated_at: '2026-11-15T00:00:00Z',
			},
		];
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		const rows = wrapper.findAll('.field-row');
		const labels = wrapper.findAll('.field-label').map((el) => el.text());
		expect(labels).toEqual(['id', 'title', 'status', 'position', 'tags', 'created_at', 'updated_at']);
		expect(rows).toHaveLength(7);

		// status and position render as strong
		expect(rows[2].find('strong').text()).toBe('published');
		expect(rows[3].find('strong').text()).toBe('4');

		// arrays are joined with commas
		expect(rows[4].find('.field-value').text()).toBe('alpha, beta');

		// date fields are locale-formatted
		const expectedCreated = new Date('2026-11-01T00:00:00Z').toLocaleDateString();
		const expectedUpdated = new Date('2026-11-15T00:00:00Z').toLocaleDateString();
		expect(rows[5].find('.field-value').text()).toBe(expectedCreated);
		expect(rows[6].find('.field-value').text()).toBe(expectedUpdated);
	});

	it('shows a dash for empty date values', async () => {
		const VisualDetail = await importVisualDetail();
		mockData.value = [{ id: '123', title: 'My Post', created_at: '' }];
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		const rows = wrapper.findAll('.field-row');
		const labels = wrapper.findAll('.field-label').map((el) => el.text());
		const createdIndex = labels.indexOf('created_at');
		expect(rows[createdIndex].find('.field-value').text()).toBe('—');
	});

	it('filters out null and undefined values from the field list', async () => {
		const VisualDetail = await importVisualDetail();
		mockData.value = [{ id: '123', title: 'My Post', status: null, notes: undefined }];
		const wrapper = mount(VisualDetail);
		await wrapper.vm.$nextTick();

		const labels = wrapper.findAll('.field-label').map((el) => el.text());
		expect(labels).toEqual(['id', 'title']);
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
