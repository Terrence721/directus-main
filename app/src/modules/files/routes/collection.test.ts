import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';
import FilesCollection from './collection.vue';

// Create persistent mock refs for useFileUpload
const fileUploadMocks = {
	upload: vi.fn(),
	progress: ref(0),
	isUploading: ref(false),
	uploadedFile: ref<Record<string, unknown> | null>(null),
	error: ref<Error | null>(null),
};

// Mock useAuth composable
const mockSession = { value: { accessToken: 'test-token' as string | undefined } };

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useAuth: () => ({
			session: mockSession,
		}),
		useFileUpload: () => fileUploadMocks,
	};
});

beforeEach(() => {
	vi.clearAllMocks();
	setActivePinia(createPinia());
	mockSession.value = { accessToken: 'test-token' };
	fileUploadMocks.progress.value = 0;
	fileUploadMocks.isUploading.value = false;
	fileUploadMocks.uploadedFile.value = null;
	fileUploadMocks.error.value = null;
	globalThis.fetch = vi.fn();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('FilesCollection', () => {
	it('mounts without crashing', () => {
		const wrapper = mount(FilesCollection);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders page title', () => {
		const wrapper = mount(FilesCollection);
		expect(wrapper.find('h1').text()).toBe('Files');
	});

	it('renders upload zone with label', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const uploadZone = wrapper.find('.upload-zone');
		expect(uploadZone.exists()).toBe(true);
		expect(uploadZone.find('.upload-label').exists()).toBe(true);
		expect(uploadZone.find('.upload-label').text()).toContain('Click or drag a file to upload');
	});

	it('shows loading state when fetching files', async () => {
		vi.mocked(globalThis.fetch).mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.files-loading').exists()).toBe(true);
		expect(wrapper.find('.files-loading').text()).toBe('Loading files…');
	});

	it('renders empty state when no files', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.files-table').exists()).toBe(true);
		expect(wrapper.find('td[colspan="3"]').text()).toBe('No files yet.');
	});

	it('renders file list when files are returned', async () => {
		const mockFiles = [
			{ id: '1', filename: 'test.pdf', mimeType: 'application/pdf', createdAt: Date.now() },
			{ id: '2', filename: 'image.png', mimeType: 'image/png', createdAt: Date.now() },
		];

		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: mockFiles }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const rows = wrapper.findAll('.files-table tbody tr');
		expect(rows).toHaveLength(2);
		expect(rows[0].findAll('td')[0].text()).toBe('test.pdf');
		expect(rows[0].findAll('td')[1].text()).toBe('application/pdf');
		expect(rows[1].findAll('td')[0].text()).toBe('image.png');
		expect(rows[1].findAll('td')[1].text()).toBe('image/png');
	});

	it('shows error state when fetch fails', async () => {
		vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.files-error').exists()).toBe(true);
		expect(wrapper.find('.files-error').text()).toBe('Network error');
	});

	it('shows error state when fetch returns non-ok', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: false,
			status: 401,
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.files-error').exists()).toBe(true);
		expect(wrapper.find('.files-error').text()).toBe('Failed to load files (401)');
	});

	it('does not fetch when no session', async () => {
		mockSession.value = { accessToken: undefined };

		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(globalThis.fetch).not.toHaveBeenCalled();
		expect(wrapper.find('.files-table').exists()).toBe(true);
	});

	it('calls useFileUpload.upload on file drop', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const dropEvent = {
			preventDefault: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as DragEvent;

		// Call the internal handleDrop method directly
		const vm = wrapper.vm as unknown as { handleDrop: (e: DragEvent) => Promise<void> };
		await vm.handleDrop(dropEvent);

		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(dropEvent.preventDefault).toHaveBeenCalled();
		expect(fileUploadMocks.upload).toHaveBeenCalledWith(file);
	});

	it('calls useFileUpload.upload on file input change', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });

		// Call the handler directly via the component instance
		const vm = wrapper.vm as unknown as { handleFileInput: (e: Event) => Promise<void> };
		const inputEvent = {
			target: { files: [file] },
			preventDefault: vi.fn(),
		} as unknown as Event;

		await vm.handleFileInput(inputEvent);

		expect(fileUploadMocks.upload).toHaveBeenCalledWith(file);
	});

	it('shows uploading state during upload', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		let resolveUpload: (value: unknown) => void;
		const uploadPromise = new Promise((resolve) => {
			resolveUpload = resolve;
		});

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		fileUploadMocks.upload.mockImplementation(() => uploadPromise);
		fileUploadMocks.progress.value = 50;
		fileUploadMocks.isUploading.value = true;

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const dropEvent = {
			preventDefault: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as DragEvent;

		const triggerPromise = wrapper.find('.upload-zone').trigger('drop', dropEvent);

		await new Promise((resolve) => setTimeout(resolve, 10));

		expect(wrapper.find('.upload-progress').exists()).toBe(true);
		expect(wrapper.find('.upload-progress').text()).toBe('Progress: 50%');
		expect(wrapper.find('.upload-label').text()).toContain('Uploading… 50%');

		resolveUpload!(undefined);
		await triggerPromise;
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));
	});

	it('shows upload success state after upload', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		fileUploadMocks.upload.mockResolvedValue(undefined);
		fileUploadMocks.progress.value = 100;
		fileUploadMocks.isUploading.value = false;
		fileUploadMocks.uploadedFile.value = { id: '123', filename: 'test.txt' };
		fileUploadMocks.error.value = null;

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const dropEvent = {
			preventDefault: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as DragEvent;

		await wrapper.find('.upload-zone').trigger('drop', dropEvent);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.upload-success').exists()).toBe(true);
		expect(wrapper.find('.upload-success').text()).toBe('Upload successful!');
	});

	it('shows upload error state on failure', async () => {
		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: [] }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const mockError = new Error('Upload failed');
		fileUploadMocks.upload.mockResolvedValue(undefined); // handleUpload awaits but catches
		fileUploadMocks.progress.value = 0;
		fileUploadMocks.isUploading.value = false;
		fileUploadMocks.uploadedFile.value = null;
		fileUploadMocks.error.value = mockError;

		const file = new File(['test'], 'test.txt', { type: 'text/plain' });
		const dropEvent = {
			preventDefault: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as DragEvent;

		await wrapper.find('.upload-zone').trigger('drop', dropEvent);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		expect(wrapper.find('.upload-error').exists()).toBe(true);
		expect(wrapper.find('.upload-error').text()).toBe('Upload failed');
	});

	it('refreshes file list after successful upload', async () => {
		const mockFiles = [{ id: '1', filename: 'new.txt', mimeType: 'text/plain', createdAt: Date.now() }];
		let fetchCallCount = 0;

		vi.mocked(globalThis.fetch).mockImplementation(() => {
			fetchCallCount++;
			return Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ data: fetchCallCount === 1 ? [] : mockFiles }),
			} as Response);
		});

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		fileUploadMocks.upload.mockResolvedValue(undefined);
		fileUploadMocks.progress.value = 100;
		fileUploadMocks.isUploading.value = false;
		fileUploadMocks.uploadedFile.value = { id: '123', filename: 'new.txt' };
		fileUploadMocks.error.value = null;

		// Initial load - empty
		expect(wrapper.find('td[colspan="3"]').text()).toBe('No files yet.');

		// Upload
		const file = new File(['test'], 'new.txt', { type: 'text/plain' });
		const dropEvent = {
			preventDefault: vi.fn(),
			dataTransfer: { files: [file] },
		} as unknown as DragEvent;

		await wrapper.find('.upload-zone').trigger('drop', dropEvent);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		// After upload, list should refresh
		expect(fetchCallCount).toBe(2);
		expect(wrapper.findAll('.files-table tbody tr')).toHaveLength(1);
		expect(wrapper.find('.files-table tbody tr td').text()).toBe('new.txt');
	});

	it('formats dates correctly in file list', async () => {
		const timestamp = new Date('2024-01-15T10:30:00Z').getTime();
		const mockFiles = [{ id: '1', filename: 'test.pdf', mimeType: 'application/pdf', createdAt: timestamp }];

		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: mockFiles }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const dateCell = wrapper.find('.files-table tbody tr td:last-child');
		const dateText = dateCell.text();
		// Should be a localized date string
		expect(dateText).toContain('2024');
		expect(dateText).toContain('15');
	});

	it('handles empty mimeType in file list', async () => {
		const mockFiles = [{ id: '1', filename: 'test', mimeType: '', createdAt: Date.now() }];

		vi.mocked(globalThis.fetch).mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ data: mockFiles }),
		} as Response);

		const wrapper = mount(FilesCollection);
		await new Promise((resolve) => setTimeout(resolve, 50));
		await new Promise((resolve) => setTimeout(resolve, 50));

		const mimeCell = wrapper.find('.files-table tbody tr td:nth-child(2)');
		expect(mimeCell.text()).toBe('—');
	});
});
