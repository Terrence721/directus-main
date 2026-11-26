import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref, computed } from 'vue';

const routerPushSpy = vi.fn();

// Mock fetch globally BEFORE any mocks
window.fetch = vi.fn();

vi.mock('@directus/composables', async () => {
  const actual = await vi.importActual<object>('@directus/composables');
  return {
    ...actual,
    resolveApiBaseUrl: vi.fn().mockReturnValue('http://localhost:8055'),
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
  routerPushSpy.mockClear();
  window.fetch.mockClear();
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

  it('shows loading state when component loading prop is true', async () => {
    const ContentDetail = await importContentDetail();
    const wrapper = mount(ContentDetail);
    const wrapperVm = wrapper.vm as { loading: boolean };
    wrapperVm.loading = true;
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.loading').exists()).toBe(true);
    expect(wrapper.find('.loading').text()).toContain('Loading...');
  });

  it('shows error state when 404 fetch fails', async () => {
    // Mock fetch to return 404 - component uses "Item not found" message
    window.fetch
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { fields: [] } }),
      });

    const ContentDetail = await importContentDetail();
    const wrapper = mount(ContentDetail);
    await wrapper.vm.$nextTick();

    // Wait for onMounted to complete and component to set error
    await new Promise(process.nextTick);
    await wrapper.vm.$nextTick();

    // Component catches 404 and sets error to "Item not found"
    expect(wrapper.find('.error').exists()).toBe(true);
    expect(wrapper.find('.error').text()).toContain('Item not found');
    expect(wrapper.find('.error button').exists()).toBe(true);
  });

  it('renders detail page header when data is available', async () => {
    // Mock fetch to return proper data for the item and fields
    window.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '123', title: 'Test Item', content: 'Test content' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { fields: [
          { name: 'title', type: 'string' },
          { name: 'content', type: 'text' },
        ] } }),
      });

    const ContentDetail = await importContentDetail();
    const wrapper = mount(ContentDetail);
    await wrapper.vm.$nextTick();

    // Wait for onMounted to complete and component to update
    await new Promise(process.nextTick);
    await wrapper.vm.$nextTick();

    // The detail-page should be rendered now
    expect(wrapper.find('.detail-page').exists()).toBe(true);
    // The page has a header with back and delete buttons
    expect(wrapper.find('.detail-header').exists()).toBe(true);
    expect(wrapper.find('.btn-back').exists()).toBe(true);
    expect(wrapper.find('.btn-delete').exists()).toBe(true);
  });

  it('goes back when back button clicked', async () => {
    // Mock fetch to return proper data for the item and fields
    window.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '123', title: 'Test Item', content: 'Test content' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { fields: [
          { name: 'title', type: 'string' },
          { name: 'content', type: 'text' },
        ] } }),
      });

    const ContentDetail = await importContentDetail();
    const wrapper = mount(ContentDetail);
    await wrapper.vm.$nextTick();

    // Wait for component to render the detail page
    await new Promise(process.nextTick);
    await wrapper.vm.$nextTick();

    const backBtn = wrapper.find('.btn-back');
    await backBtn.element.click();

    expect(routerPushSpy).toHaveBeenCalledWith('/content/posts');
  });

  it('deletes item when delete button clicked', async () => {
    // Mock fetch to return proper data for the item and fields
    window.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { id: '123', title: 'Test Item', content: 'Test content' } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { fields: [
          { name: 'title', type: 'string' },
          { name: 'content', type: 'text' },
        ] } }),
      })
      // DELETE request
      .mockResolvedValueOnce({
        ok: true,
      });

    const ContentDetail = await importContentDetail();
    const wrapper = mount(ContentDetail);
    await wrapper.vm.$nextTick();

    // Wait for component to render the detail page
    await new Promise(process.nextTick);
    await wrapper.vm.$nextTick();

    // Mock confirm
    window.confirm = vi.fn().mockReturnValue(true);

    const deleteBtn = wrapper.find('.btn-delete');
    await deleteBtn.element.click();

    expect(routerPushSpy).toHaveBeenCalledWith('/content/posts');
  });
});