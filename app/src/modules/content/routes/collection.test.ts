import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed } from 'vue';

const mockFlatCollections = ref<Array<{ collection: string; label: string; meta?: { group?: string } }>>([]);
const mockLoading = ref(false);
const mockFetchCollections = vi.fn();
const routerPushSpy = vi.fn();

vi.mock('../composables/use-collections-manager.js', async () => {
	const actual = await vi.importActual<typeof import('../composables/use-collections-manager.js')>(
		'../composables/use-collections-manager.js',
	);
	return {
		...actual,
		useCollectionsManager: () => ({
			flatCollections: computed(() => mockFlatCollections.value),
			loading: mockLoading,
			error: ref(null),
			fetchCollections: mockFetchCollections,
		}),
	};
});

vi.mock('../composables/use-navigation.js', async () => {
	const actual = await vi.importActual<typeof import('../composables/use-navigation.js')>(
		'../composables/use-navigation.js',
	);
	return {
		...actual,
		useNavigation: () => ({
			activeCollection: ref<string>(''),
			collapsedGroups: ref(new Set<string>()),
			toggleGroup: vi.fn(),
		}),
	};
});

vi.mock('vue-router', () => ({
	useRouter: () => ({ push: routerPushSpy }),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockFlatCollections.value = [];
	mockLoading.value = false;
	mockFetchCollections.mockClear();
	routerPushSpy.mockClear();

	// Mock fetch globally to prevent real network calls
	window.fetch = vi.fn().mockResolvedValue({
		ok: true,
		json: async () => ({ data: [] }),
	});
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importContentCollection(): Promise<(typeof import('./collection.vue'))['default']> {
	return (await import('./collection.vue')).default;
}

describe('ContentCollection', () => {
	it('mounts without crashing', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders sidebar with collections heading', async () => {
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		expect(wrapper.find('.sidebar__header h2').text()).toBe('Collections');
	});

	it('shows loading state when fetching collections', async () => {
		mockLoading.value = true;
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.btn-refresh').attributes('disabled')).toBeDefined();
		expect(wrapper.find('.btn-refresh').text()).toContain('Loading');
	});

	it('shows empty state when no collections', async () => {
		mockLoading.value = false;
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		expect(wrapper.find('.empty-state').exists()).toBe(true);
		expect(wrapper.find('.empty-state').text()).toContain('No collections yet');
	});

	it('renders collections in sidebar', async () => {
		mockFlatCollections.value = [
			{ collection: 'posts', label: 'Posts' },
			{ collection: 'authors', label: 'Authors' },
		];
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		const navItems = wrapper.findAll('.nav-item');
		expect(navItems).toHaveLength(2);
		expect(navItems[0].text()).toContain('Posts');
		expect(navItems[1].text()).toContain('Authors');
	});

	it('navigates to collection items when sidebar item clicked', async () => {
		mockFlatCollections.value = [{ collection: 'posts', label: 'Posts' }];
		const ContentCollection = await importContentCollection();
		const wrapper = mount(ContentCollection);
		await wrapper.vm.$nextTick();

		const navBtn = wrapper.find('.nav-btn');
		await navBtn.trigger('click');

		expect(routerPushSpy).toHaveBeenCalledWith('/#/content/posts');
	});
});
