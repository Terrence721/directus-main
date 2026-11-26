import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routeParams = ref<Record<string, string>>({ collection: 'posts', id: '123' });
const routerPushSpy = vi.fn();

vi.mock('vue-router', () => ({
	useRoute: () => ({ params: routeParams.value }),
	useRouter: () => ({ push: routerPushSpy }),
}));

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return { ...actual, resolveApiBaseUrl: () => 'http://localhost:8055' };
});

const mockFields = [
	{ name: 'title', type: 'string' },
	{ name: 'views', type: 'integer' },
	{ name: 'published_at', type: 'timestamp' },
	{ name: 'meta', type: 'json' },
];

let currentItem: Record<string, unknown> = {
	id: '123',
	title: 'Hello',
	views: 9,
	published_at: '2024-01-01T00:00:00Z',
	meta: { tag: 'a' },
};
let itemsFail = false;
const patchCalls: { url: string; body?: string }[] = [];
const deleteCalls: string[] = [];

window.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
	const url = String(input);
	const method = (init?.method ?? 'GET').toUpperCase();
	if (url.includes('/collections/')) {
		return Promise.resolve({ ok: true, json: async () => ({ data: { fields: mockFields } }) });
	}
	if (url.includes('/items/')) {
		if (method === 'PATCH') {
			patchCalls.push({ url, body: init?.body });
			return Promise.resolve({ ok: true, json: async () => ({}) });
		}
		if (method === 'DELETE') {
			deleteCalls.push(url);
			return Promise.resolve({ ok: true, json: async () => ({}) });
		}
		if (itemsFail) {
			return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
		}
		return Promise.resolve({ ok: true, json: async () => ({ data: currentItem }) });
	}
	return Promise.resolve({ ok: true, json: async () => ({}) });
});

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routeParams.value = { collection: 'posts', id: '123' };
	currentItem = { id: '123', title: 'Hello', views: 9, published_at: '2024-01-01T00:00:00Z', meta: { tag: 'a' } };
	itemsFail = false;
	patchCalls.length = 0;
	deleteCalls.length = 0;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importContentDetail(): Promise<(typeof import('./detail.vue'))['default']> {
	return (await import('./detail.vue')).default;
}

describe('ContentDetail', () => {
	it('mounts without crashing', async () => {
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		expect(wrapper.exists()).toBe(true);
	});

	it('loads the item and fields, rendering inputs and textareas by field type', async () => {
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		expect(window.fetch).toHaveBeenCalledWith('http://localhost:8055/items/posts/123');
		expect(window.fetch).toHaveBeenCalledWith('http://localhost:8055/collections/posts');

		expect(wrapper.find('.detail-page').exists()).toBe(true);
		expect(wrapper.find('.detail-header h1').text()).toBe('123');

		// string + integer + timestamp fields render as inputs; json renders as a textarea
		const inputs = wrapper.findAll('.field-group input');
		expect(inputs).toHaveLength(3);
		expect((inputs[0].element as HTMLInputElement).value).toBe('Hello');
		expect((inputs[1].element as HTMLInputElement).value).toBe('9');
		expect(inputs[2].attributes('type')).toBe('datetime-local');

		const textareas = wrapper.findAll('.field-group textarea');
		expect(textareas).toHaveLength(1);
		// formatFieldValue stringifies non-string values compactly
		expect((textareas[0].element as HTMLTextAreaElement).value).toBe(JSON.stringify({ tag: 'a' }));
	});

	it('renders empty inputs for null or missing field values', async () => {
		currentItem = { id: '123', title: null, views: undefined };
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		const inputs = wrapper.findAll('.field-group input');
		expect((inputs[0].element as HTMLInputElement).value).toBe('');
		expect((inputs[1].element as HTMLInputElement).value).toBe('');
	});

	it('shows the error state on item fetch failure and recovers via retry', async () => {
		itemsFail = true;
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		expect(wrapper.find('.error').exists()).toBe(true);
		expect(wrapper.find('.error p').text()).toBe('Item not found');

		itemsFail = false;
		await wrapper.find('.error button').trigger('click');
		await flushPromises();

		expect(wrapper.find('.detail-page').exists()).toBe(true);
	});

	it('saves a field on blur with a PATCH request', async () => {
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		const titleInput = wrapper.findAll('.field-group input')[0];
		await titleInput.setValue('World');
		await titleInput.trigger('blur');
		await flushPromises();

		expect(patchCalls).toHaveLength(1);
		expect(patchCalls[0].url).toBe('http://localhost:8055/items/posts/123');
		expect(JSON.parse(patchCalls[0].body!)).toEqual({ title: 'World' });
	});

	it('saves a json field typed into the textarea on blur', async () => {
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		const textarea = wrapper.find('.field-group textarea');
		await textarea.setValue('{"tag":"b"}');
		await textarea.trigger('blur');
		await flushPromises();

		expect(patchCalls).toHaveLength(1);
		expect(JSON.parse(patchCalls[0].body!)).toEqual({ meta: '{"tag":"b"}' });
	});

	it('navigates back to the collection when the back button is clicked', async () => {
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		await wrapper.find('.btn-back').trigger('click');
		expect(routerPushSpy).toHaveBeenCalledWith('/content/posts');
	});

	it('deletes the item when confirmed', async () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => true),
		);
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		await wrapper.find('.btn-delete').trigger('click');
		await flushPromises();

		expect(deleteCalls).toEqual(['http://localhost:8055/items/posts/123']);
		expect(routerPushSpy).toHaveBeenCalledWith('/content/posts');
	});

	it('does not delete when the confirmation is declined', async () => {
		vi.stubGlobal(
			'confirm',
			vi.fn(() => false),
		);
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		await wrapper.find('.btn-delete').trigger('click');
		await flushPromises();

		expect(deleteCalls).toHaveLength(0);
		expect(routerPushSpy).not.toHaveBeenCalled();
	});

	it('skips loading entirely when the route params are empty', async () => {
		routeParams.value = { collection: '', id: '' };
		const ContentDetail = await importContentDetail();
		const wrapper = mount(ContentDetail);
		await flushPromises();

		// No item or collection fetch happens without params
		const fetchMock = window.fetch as unknown as { mock: { calls: unknown[][] } };
		expect(fetchMock.mock.calls.some((call) => String(call[0]).includes('/items/'))).toBe(false);
		// The page still renders with the fallback header
		expect(wrapper.find('.detail-page').exists()).toBe(true);
		expect(wrapper.find('.detail-header h1').text()).toBe('Editing');
	});
});
