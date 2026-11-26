import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed } from 'vue';

const routerPushSpy = vi.fn();

// The collection browser fetches item data when a collection becomes active;
// stub the global fetch so those calls never reach the network.
window.fetch = vi.fn();

vi.mock('../composables/use-collections-manager', () => ({
	useCollectionsManager: () => ({
		flatCollections: computed(() => mockFlatCollections.value),
		loading: mockLoading,
		error: ref(null),
		fetchCollections: mockFetchCollections,
	}),
}));

vi.mock('../composables/use-navigation', () => ({
	useNavigation: () => ({
		activeCollection: ref<string>(''),
		collapsedGroups: ref(new Set<string>()),
		toggleGroup: vi.fn(),
	}),
}));

vi.mock('vue-router', () => ({
	useRouter: () => ({ push: routerPushSpy }),
}));

const mockFlatCollections = ref<{ collection: string; label: string }[]>([]);
const mockLoading = ref(false);
const mockFetchCollections = vi.fn();

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockFlatCollections.value = [];
	mockLoading.value = false;
	routerPushSpy.mockClear();
	(window.fetch as unknown as ReturnType<typeof vi.fn>).mockReset();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importVisualCollection(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

describe('VisualCollection', () => {
	it('mounts without crashing', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders the collections sidebar heading', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		expect(wrapper.find('.sidebar__header h2').text()).toBe('Collections');
	});

	it('shows loading state when collections are loading', async () => {
		const VisualCollection = await importVisualCollection();
		mockLoading.value = true;
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();

		const refresh = wrapper.find('.btn-refresh');
		expect(refresh.attributes('disabled')).toBeDefined();
		expect(refresh.text()).toBe('Loading...');
	});

	it('shows empty state when no collections', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty-state').exists()).toBe(true);
		expect(wrapper.find('.empty-state').text()).toContain('No collections yet');
	});

	it('renders nav items for each collection and navigates on click', async () => {
		const VisualCollection = await importVisualCollection();
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts' },
			{ collection: 'users', label: 'Users' },
		];
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();

		const navItems = wrapper.findAll('.nav-item');
		expect(navItems).toHaveLength(2);
		expect(navItems[0].text()).toContain('Posts');

		await navItems[0].find('.nav-btn').trigger('click');
		expect(routerPushSpy).toHaveBeenCalledWith('/#/visual/posts');
	});

	it('shows no-collection prompt when no collection is active', async () => {
		const VisualCollection = await importVisualCollection();
		const wrapper = mount(VisualCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.no-collection').exists()).toBe(true);
		expect(wrapper.find('.no-collection').text()).toContain('Select a collection');
	});
});
