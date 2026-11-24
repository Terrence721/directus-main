import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ActivityCollection from './collection.vue';

// Use vi.hoisted to ensure mocks are available at top level
const { mockUseAuth, mockUseActivity } = vi.hoisted(() => ({
	mockUseAuth: vi.fn(),
	mockUseActivity: vi.fn(),
}));

vi.mock('@directus/composables', () => ({
	useAuth: mockUseAuth,
	useActivity: mockUseActivity,
}));

const mockActivityData = [
	{
		id: '1',
		action: 'create',
		collection: 'posts',
		recordId: '123',
		userEmail: 'user@example.com',
		createdAt: 1672574400000,
	},
	{
		id: '2',
		action: 'update',
		collection: 'comments',
		recordId: '456',
		userEmail: 'user@example.com',
		createdAt: 1672660800000,
	},
];

const mockError = new Error('Failed to fetch activity');

const mountComponent = (options = {}) => {
	return mount(ActivityCollection, {
		global: {
			stubs: {
				'router-link': true,
				'router-view': true,
			},
		},
		...options,
	});
};

describe('ActivityCollection', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuth.mockReturnValue({
			session: ref({ accessToken: 'test-token', expiresAt: Date.now() + 60000 }),
		});
		mockUseActivity.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(null),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});
	});

	it('renders loading state', () => {
		mockUseActivity.mockReturnValue({
			data: ref([]),
			loading: ref(true),
			error: ref(null),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});

		const wrapper = mountComponent();

		expect(wrapper.find('.activity-loading').exists()).toBe(true);
		expect(wrapper.find('.activity-table').exists()).toBe(false);
		expect(wrapper.find('.activity-error').exists()).toBe(false);
		expect(wrapper.find('.activity-empty').exists()).toBe(false);
	});

	it('renders error state', () => {
		mockUseActivity.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(mockError),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});

		const wrapper = mountComponent();

		expect(wrapper.find('.activity-error').exists()).toBe(true);
		expect(wrapper.find('.activity-error').text()).toContain(mockError.message);
		expect(wrapper.find('.activity-table').exists()).toBe(false);
		expect(wrapper.find('.activity-loading').exists()).toBe(false);
		expect(wrapper.find('.activity-empty').exists()).toBe(false);
	});

	it('renders empty state when no activity exists', () => {
		mockUseActivity.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(null),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});

		const wrapper = mountComponent();

		expect(wrapper.find('.activity-empty').exists()).toBe(true);
		expect(wrapper.find('.activity-table').exists()).toBe(false);
		expect(wrapper.find('.activity-loading').exists()).toBe(false);
		expect(wrapper.find('.activity-error').exists()).toBe(false);
	});

	it('renders activity table with data', () => {
		mockUseActivity.mockReturnValue({
			data: ref(mockActivityData),
			loading: ref(false),
			error: ref(null),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});

		const wrapper = mountComponent();

		expect(wrapper.find('.activity-table').exists()).toBe(true);
		expect(wrapper.findAll('tbody tr').length).toBe(mockActivityData.length);
		expect(wrapper.find('.activity-loading').exists()).toBe(false);
		expect(wrapper.find('.activity-error').exists()).toBe(false);
		expect(wrapper.find('.activity-empty').exists()).toBe(false);
	});

	it('displays correct action badges', () => {
		mockUseActivity.mockReturnValue({
			data: ref(mockActivityData),
			loading: ref(false),
			error: ref(null),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});

		const wrapper = mountComponent();

		const badges = wrapper.findAll('.action-badge');
		expect(badges[0].classes()).toContain('action-create');
		expect(badges[1].classes()).toContain('action-update');
	});

	it('displays fallback values for null fields', () => {
		const dataWithNulls = [
			{
				id: '3',
				action: 'delete',
				collection: null,
				recordId: null,
				userEmail: 'user@example.com',
				createdAt: 1672747200000,
			},
		];

		mockUseActivity.mockReturnValue({
			data: ref(dataWithNulls),
			loading: ref(false),
			error: ref(null),
			fetchActivity: vi.fn(),
			logActivity: vi.fn(),
		});

		const wrapper = mountComponent();

		const cells = wrapper.findAll('tbody tr td');
		expect(cells[1].text()).toBe('—'); // collection
		expect(cells[2].text()).toBe('—'); // recordId
	});

	it('calls fetchActivity on mount when authenticated', async () => {
		const fetchActivity = vi.fn();
		mockUseActivity.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(null),
			fetchActivity,
			logActivity: vi.fn(),
		});

		mountComponent();

		// Wait for onMounted to run
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(fetchActivity).toHaveBeenCalledOnce();
	});

	it('does not call fetchActivity on mount when not authenticated', async () => {
		mockUseAuth.mockReturnValue({
			session: ref(null),
		});
		const fetchActivity = vi.fn();
		mockUseActivity.mockReturnValue({
			data: ref([]),
			loading: ref(false),
			error: ref(null),
			fetchActivity,
			logActivity: vi.fn(),
		});

		mountComponent();

		// Wait for onMounted to run
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(fetchActivity).not.toHaveBeenCalled();
	});
});
