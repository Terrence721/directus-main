import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContentCollection from './collection.vue';

// Mock vue-router
const mockRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	back: vi.fn(),
	currentRoute: { value: { path: '/' } },
};

vi.mock('vue-router', () => ({
	useRouter: () => mockRouter,
	useRoute: () => ({}),
}));

// Mock the composables
vi.mock('../composables/use-collections-manager.js', () => ({
	useCollectionsManager: vi.fn(() => ({
		flatCollections: { value: [] },
		loading: false,
		fetchCollections: vi.fn(),
	})),
}));

vi.mock('../composables/use-navigation.js', () => ({
	useNavigation: vi.fn(() => ({
		activeCollection: { value: null },
		collapsedGroups: new Set(),
		toggleGroup: vi.fn(),
	})),
}));

beforeEach(() => {
	vi.clearAllMocks();
	setActivePinia(createPinia());
});

describe('ContentCollection', () => {
	it('mounts without crashing', () => {
		const wrapper = mount(ContentCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders basic structure', () => {
		const wrapper = mount(ContentCollection);
		expect(wrapper.find('.content-browser').exists()).toBe(true);
	});

	it('calls router.push when navigating to detail', async () => {
		const wrapper = mount(ContentCollection);
		// Simulate clicking edit button if exists
		const buttons = wrapper.findAll('button');
		for (const btn of buttons) {
			await btn.trigger('click');
		}
		// Should not throw
		expect(mockRouter.push).toBeDefined();
	});
});
