import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { useFileUpload } from './useFileUpload';

const { useServer: mockUseServer, resolveApiBaseUrl: mockResolveApiBaseUrl } = vi.hoisted(() => ({
	useServer: vi.fn(),
	resolveApiBaseUrl: vi.fn(() => 'http://test-api.example.com'),
}));

vi.mock('./useServer', () => ({
	useServer: mockUseServer,
	resolveApiBaseUrl: mockResolveApiBaseUrl,
}));

globalThis.fetch = vi.fn();

describe('useFileUpload', () => {
	const mockServerInfo = {
		projectLogoUrl: 'http://test-api.example.com',
	};

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockUseServer.mockReturnValue({
			info: ref(mockServerInfo),
		});
		mockResolveApiBaseUrl.mockReturnValue('http://test-api.example.com');
		vi.mocked(globalThis.fetch).mockReset();
	});

	it('returns refs with default values', () => {
		const result = useFileUpload();

		expect(result.progress.value).toBe(0);
		expect(result.error.value).toBeNull();
		expect(result.isUploading.value).toBe(false);
		expect(result.uploadedFile.value).toBeNull();
	});

	it('accepts options', () => {
		const result = useFileUpload({
			collection: 'media',
			field: 'file',
			filename: 'test.jpg',
		});

		expect(result.upload).toBeTypeOf('function');
	});

	describe('upload', () => {
		it('uploads a File with correct form data', async () => {
			const file = new File(['test content'], 'test.jpg', { type: 'text/plain' });

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1', name: 'test.jpg' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload({ collection: 'media', field: 'file' });
			const uploaded = await result.upload(file);

			expect(uploaded).toEqual({ id: 'file-1', name: 'test.jpg' });
			expect(result.uploadedFile.value).toEqual({ id: 'file-1', name: 'test.jpg' });
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
			expect(url).toBe('http://test-api.example.com/assets');
			expect(options?.method).toBe('POST');

			const formData = options?.body as FormData;
			expect(formData.has('collection')).toBe(true);
			expect(formData.get('collection')).toBe('media');
			expect(formData.has('file')).toBe(true);
			expect((formData.get('file') as File).name).toBe('test.jpg');
		});

		it('uploads FormData directly', async () => {
			const formData = new FormData();
			formData.append('custom', 'value');

			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-2' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload();
			const uploaded = await result.upload(formData);

			expect(uploaded).toEqual({ id: 'file-2' });
			expect(result.uploadedFile.value).toEqual({ id: 'file-2' });
			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();

			const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
			expect(options?.body).toBe(formData);

			vi.restoreAllMocks();
		});

		it('sets isUploading true during upload', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload();
			const uploadPromise = result.upload(new File(['test'], 'test.txt'));

			expect(result.isUploading.value).toBe(true);
			expect(result.progress.value).toBe(0);

			await uploadPromise;

			expect(result.isUploading.value).toBe(false);
			expect(result.progress.value).toBe(100);
			vi.restoreAllMocks();
		});

		it('sets progress to 0 and 100', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload();

			expect(result.progress.value).toBe(0);

			await result.upload(new File(['test'], 'test.txt'));

			expect(result.progress.value).toBe(100);
			vi.restoreAllMocks();
		});

		it('sets error and resets isUploading on fetch rejection', async () => {
			vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

			const result = useFileUpload();
			const uploaded = await result.upload(new File(['test'], 'test.txt'));

			expect(uploaded).toBeNull();
			expect(result.error.value).toBeInstanceOf(Error);
			expect(result.error.value?.message).toBe('Network error');
			expect(result.isUploading.value).toBe(false);
			expect(result.progress.value).toBe(100);
			vi.restoreAllMocks();
		});

		it('handles non-OK response as error', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(new Response(null, { status: 404, statusText: 'Not Found' }));

			const result = useFileUpload();
			const uploaded = await result.upload(new File(['test'], 'test.txt'));

			expect(uploaded).toBeNull();
			expect(result.error.value).toBeInstanceOf(Error);
			expect(result.error.value?.message).toContain('404');
			expect(result.isUploading.value).toBe(false);
			expect(result.progress.value).toBe(100);
			vi.restoreAllMocks();
		});

		it('returns null when server info is missing', async () => {
			mockUseServer.mockReturnValue({
				info: ref(null),
			});

			const result = useFileUpload();
			const uploaded = await result.upload(new File(['test'], 'test.txt'));

			expect(uploaded).toBeNull();
			expect(result.error.value).toBeInstanceOf(Error);
			expect(result.error.value?.message).toBe('Server info not available');
		});

		it('returns null when upload already in progress', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload();
			const firstUpload = result.upload(new File(['test'], 'test.txt'));

			// Second upload should not start until first completes
			const secondUpload = result.upload(new File(['test'], 'test2.txt'));

			const results = await Promise.all([firstUpload, secondUpload]);

			expect(results[0]).toEqual({ id: 'file-1' });
			expect(results[1]).toBeNull();
			vi.restoreAllMocks();
		});

		it('uses filename option when provided', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload({ field: 'file', filename: 'custom.pdf' });
			await result.upload(new File(['test'], 'original.txt'));

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
			const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
			const formData = options.body as FormData;
			expect(formData.get('file')?.name).toBe('custom.pdf');
			vi.restoreAllMocks();
		});

		it('uses filename from File when option not provided', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload({ field: 'file' });
			await result.upload(new File(['test'], 'myfile.doc'));

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
			const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
			const formData = options.body as FormData;
			expect(formData.get('file')?.name).toBe('myfile.doc');
			vi.restoreAllMocks();
		});

		it('includes collection in form data when provided', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload({ collection: 'media' });
			await result.upload(new File(['test'], 'file.txt'));

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
			const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
			const formData = options.body as FormData;
			expect(formData.has('collection')).toBe(true);
			expect(formData.get('collection')).toBe('media');
			vi.restoreAllMocks();
		});

		it('omits collection from form data when not provided', async () => {
			vi.mocked(globalThis.fetch).mockResolvedValue(
				new Response(JSON.stringify({ data: { id: 'file-1' } }), {
					status: 200,
					statusText: 'OK',
				}),
			);

			const result = useFileUpload();
			await result.upload(new File(['test'], 'file.txt'));

			expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledOnce();
			const [, options] = vi.mocked(globalThis.fetch).mock.calls[0];
			const formData = options.body as FormData;
			expect(formData.has('collection')).toBe(false);
			vi.restoreAllMocks();
		});
	});
});
