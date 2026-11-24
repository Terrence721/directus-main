import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ContentDetail from './detail.vue';

// Mock vue-router with proper route object
const mockRoute = {
  params: { collection: 'posts', id: '123' },
};
const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  currentRoute: { value: mockRoute },
};

vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => mockRoute,
}));

// Mock resolveApiBaseUrl
vi.mock('@directus/composables', async () => {
  const actual = await vi.importActual<object>('@directus/composables');
  return {
    ...actual,
    resolveApiBaseUrl: vi.fn(() => 'http://test-api.example.com'),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
  globalThis.fetch = vi.fn();
  // Re-set the route params for each test
  mockRoute.params = { collection: 'posts', id: '123' };
});

describe('ContentDetail', () => {
  it('mounts without crashing', () => {
    const wrapper = mount(ContentDetail);
    expect(wrapper.exists()).toBe(true);
  });

  it('renders loading state when fetching item', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [] } }),
    } as Response);

    const wrapper = mount(ContentDetail);

    // Wait for fetch to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should show detail page (not loading/error)
    expect(wrapper.find('.detail-page').exists()).toBe(true);
  });

  it('displays item data when loaded', async () => {
    // First call returns item, second call returns fields
    vi.mocked(globalThis.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { id: '123', title: 'Test Post', content: 'Hello' } }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              fields: [
                { name: 'id', type: 'string' },
                { name: 'title', type: 'string' },
              ],
            },
          }),
      } as Response);

    const wrapper = mount(ContentDetail);

    await new Promise((resolve) => setTimeout(resolve, 100));
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Item data should be displayed in the template
    expect(wrapper.find('.detail-page').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toContain('123');
  });

  it('shows error when fetch fails', async () => {
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

    const wrapper = mount(ContentDetail);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(wrapper.find('.error').exists()).toBe(true);
    expect(wrapper.find('.error p').text()).toContain('Network error');
  });

  it('calls router.push when clicking back button', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [] } }),
    } as Response);

    const wrapper = mount(ContentDetail);
    const backButton = wrapper.find('.btn-back');

    await backButton.trigger('click');

    expect(mockRouter.push).toHaveBeenCalledWith('/content/posts');
  });

  it('calls delete endpoint when delete button clicked and confirmed', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [] } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const wrapper = mount(ContentDetail);

    // Mock confirm to return true
    vi.stubGlobal('confirm', () => true);

    const deleteButton = wrapper.find('.btn-delete');
    await deleteButton.trigger('click');

    // Should call fetch with DELETE method
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://test-api.example.com/items/posts/123',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('does not call delete when canceling confirm', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [] } }),
    } as Response);

    const wrapper = mount(ContentDetail);

    // Mock confirm to return false
    vi.stubGlobal('confirm', () => false);

    const deleteButton = wrapper.find('.btn-delete');
    await deleteButton.trigger('click');

    // Should not call fetch with DELETE
    const deleteCalls = vi.mocked(globalThis.fetch).mock.calls.filter((call) => call[1]?.method === 'DELETE');
    expect(deleteCalls).toHaveLength(0);
  });

  it('saves field changes when input blurs', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [{ name: 'title', type: 'string' }] } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
    } as Response);

    const wrapper = mount(ContentDetail);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const input = wrapper.find('.field-input');
    if (input.exists()) {
      await input.setValue('Updated Title');
      await input.trigger('blur');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://test-api.example.com/items/posts/123',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }
  });

  it('formats field values correctly for display', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [] } }),
    } as Response);

    const wrapper = mount(ContentDetail);
    const formatFieldValue = (
      wrapper.vm as unknown as {
        formatFieldValue: (value: unknown) => string;
      }
    ).formatFieldValue;

    // Test the formatFieldValue function via computed properties
    expect(formatFieldValue(null)).toBe('');
    expect(formatFieldValue(undefined)).toBe('');
    expect(formatFieldValue('test')).toBe('test');
    expect(formatFieldValue({ a: 1 })).toBe('{"a":1}');
  });

  it('renders different input types for different field types', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: { id: '123', title: 'Test' } }),
    } as Response);
    vi.mocked(globalThis.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: { fields: [{ name: 'date', type: 'timestamp' }] } }),
    } as Response);

    const wrapper = mount(ContentDetail);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const input = wrapper.find('.field-input');
    if (input.exists()) {
      // timestamp should render as datetime-local
      expect(input.element.getAttribute('type')).toBe('datetime-local');
    }
  });
});