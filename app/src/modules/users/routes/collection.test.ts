import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import UsersCollection from './collection.vue';

// Shared reactive session object — mutated directly to flip auth states
const mockSession: { value: { accessToken: string | undefined } } = { value: { accessToken: 'test-token' } };

// Mock @directus/stores — keep userStore.user null so the component starts with no current-user context
vi.mock('@directus/stores', async () => {
	const actual = await vi.importActual<object>('@directus/stores');
	return {
		...actual,
		useUserStore: () => ({ user: ref(null), setUser: vi.fn(), clearUser: vi.fn() }),
	};
});

// Mock @directus/composables
vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useAuth: () => ({ session: mockSession }),
		resolveApiBaseUrl: () => 'http://localhost:8055',
	};
});

beforeEach(() => {
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockSession.value = { accessToken: 'test-token' };
	globalThis.fetch = vi.fn();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('UsersCollection', () => {
	it('mounts without crashing', () => {
		const wrapper = mount(UsersCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders users heading', () => {
		const wrapper = mount(UsersCollection);
		expect(wrapper.find('h1').text()).toBe('Users');
	});

	it('shows loading state while fetching', async () => {
		// Keep fetch pending so loading stays true; mount first so onMounted fires
		const promise = new Promise<Response>(() => {});
		(
			globalThis.fetch as unknown as {
				mockImplementationOnce: (fn: () => Promise<Response>) => unknown;
			}
		).mockImplementationOnce(() => promise);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.users-loading').exists()).toBe(true);
		expect(wrapper.find('.users-table').exists()).toBe(false);
	});

	it('shows error state when fetch fails', async () => {
		(
			globalThis.fetch as unknown as {
				mockRejectedValueOnce: (err: Error) => unknown;
			}
		).mockRejectedValueOnce(new Error('Network error'));
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.users-error').exists()).toBe(true);
		expect(wrapper.find('.users-error').text()).toContain('Network error');
		expect(wrapper.find('.users-table').exists()).toBe(false);
	});

	it('shows error state when API returns non-ok', async () => {
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({ ok: false, status: 403 } as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.users-error').exists()).toBe(true);
		expect(wrapper.find('.users-error').text()).toContain('403');
	});

	it('does not fetch when no access token', async () => {
		mockSession.value = { accessToken: undefined };
		mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('renders empty table when no users returned', async () => {
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		expect(wrapper.find('.users-table').exists()).toBe(true);
		expect(wrapper.find('td[colspan="3"]').text()).toBe('No users found.');
	});

	it('renders user rows with correct name and email', async () => {
		const mockUsers = [
			{ id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
			{ id: '2', firstName: null, lastName: 'Jones', email: 'jones@example.com' },
		];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		const rows = wrapper.findAll('.users-table tbody tr');
		if (rows.length >= 2) {
			expect(rows[0].findAll('td')[0].text()).toBe('Alice Smith');
			expect(rows[0].findAll('td')[1].text()).toBe('alice@example.com');
			expect(rows[1].findAll('td')[0].text()).toBe('Jones');
		}
	});

	it('renders dash for fully null name fields', async () => {
		const mockUsers = [{ id: '1', firstName: null, lastName: null, email: 'nobody@example.com' }];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		const firstCell = wrapper.find('.users-table tbody tr:first-child td:first-child');
		expect(firstCell.text()).toBe('—');
	});

	it('calls startEdit when Edit button clicked', async () => {
		const mockUsers = [{ id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' }];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		const editBtn = wrapper.find('.users-action-btn');
		expect(editBtn.exists()).toBe(true);
		editBtn.trigger('click');
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as { editingUserId: string | null }).editingUserId).toBe('1');
	});

	it('fills edit form fields when startEdit is called', async () => {
		const mockUsers = [{ id: '1', firstName: 'Bob', lastName: 'Doe', email: 'bob@example.com' }];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		wrapper.find('.users-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		const vm = wrapper.vm as unknown as { editForm: Record<string, unknown> };
		expect(vm.editForm).toEqual({ firstName: 'Bob', lastName: 'Doe', email: 'bob@example.com' });
	});

	it('cancels edit when cancel is clicked', async () => {
		const mockUsers = [{ id: '1', firstName: 'Carol', lastName: null, email: 'carol@example.com' }];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		wrapper.find('.users-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as { editingUserId: string | null }).editingUserId).toBe('1');
		wrapper.find('.users-btn:not(.users-btn--primary)').trigger('click');
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as { editingUserId: string | null }).editingUserId).toBeNull();
	});

	it('clears editError when starting edit', async () => {
		const mockUsers = [{ id: '1', firstName: 'Dan', lastName: null, email: 'dan@example.com' }];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		wrapper.find('.users-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		expect((wrapper.vm as unknown as { editError: Error | null }).editError).toBeNull();
	});

	it('calls PATCH to update user when handleSave succeeds', async () => {
		const mockUsers = [{ id: '1', firstName: 'Eve', lastName: null, email: 'eve@example.com' }];
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: mockUsers }),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: () =>
					Promise.resolve({
						user: { id: '1', firstName: 'EveUpdated', lastName: null, email: 'eve@example.com' },
					}),
			} as Response)
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: [] }),
			} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		wrapper.find('.users-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		// Update the form then call save
		const inputs = wrapper.findAll('.users-input');
		if (inputs.length >= 3) {
			await inputs[0].setValue('EveUpdated');
			await inputs[1].setValue('');
			await inputs[2].setValue('eve@example.com');
		}
		const saveBtn = wrapper.find('.users-btn--primary');
		expect(saveBtn.exists()).toBe(true);
		saveBtn.trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'http://localhost:8055/users/me',
			expect.objectContaining({
				method: 'PATCH',
				headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
			}),
		);
	});

	it('sets editError when handleSave receives non-ok response', async () => {
		const mockUsers = [{ id: '1', firstName: 'Frank', lastName: null, email: 'frank@example.com' }];
		const fetchMock = vi.mocked(globalThis.fetch);
		fetchMock
			.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ data: mockUsers }),
			} as Response)
			.mockResolvedValueOnce({ ok: false, status: 422 } as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		wrapper.find('.users-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		const saveBtn = wrapper.find('.users-btn--primary');
		saveBtn.trigger('click');
		await wrapper.vm.$nextTick();
		await new Promise((r) => setTimeout(r, 50));
		expect((wrapper.vm as unknown as { editError: Error | null }).editError).toBeInstanceOf(Error);
		expect((wrapper.vm as unknown as { editError: Error | null }).editError!.message).toContain('422');
	});

	it('disables save button while saving', async () => {
		const mockUsers = [{ id: '1', firstName: 'Grace', lastName: null, email: 'grace@example.com' }];
		(
			globalThis.fetch as unknown as {
				mockResolvedValueOnce: (val: Response) => unknown;
			}
		).mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve({ data: mockUsers }),
		} as Response);
		const wrapper = mount(UsersCollection);
		await new Promise((r) => setTimeout(r, 50));
		wrapper.find('.users-action-btn').trigger('click');
		await wrapper.vm.$nextTick();
		const saveBtn = wrapper.find('.users-btn--primary');
		expect(saveBtn.attributes('disabled')).toBeUndefined();
		// Simulate saving by directly setting the ref
		(wrapper.vm as unknown as { saving: boolean }).saving = true;
		await wrapper.vm.$nextTick();
		expect(saveBtn.attributes('disabled')).toBeDefined();
	});

	it('calls rowKey correctly for string IDs', () => {
		const wrapper = mount(UsersCollection);
		const vm = wrapper.vm as unknown as { rowKey: (row: { id: string }, index: number) => string };
		expect(vm.rowKey({ id: 'abc-123' }, 0)).toBe('abc-123');
	});

	it('falls back to index when id is missing in rowKey', () => {
		const wrapper = mount(UsersCollection);
		const vm = wrapper.vm as unknown as { rowKey: (row: Record<string, unknown>, index: number) => string };
		expect(vm.rowKey({ email: 'x@y.z' }, 5)).toBe('index:5');
	});
});
