import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { ref } from 'vue';
import { useServer } from './useServer';

const { useServerStore: mockUseServerStore } = vi.hoisted(() => ({
	useServerStore: vi.fn(),
}));

vi.mock('@directus/stores', () => ({
	useServerStore: mockUseServerStore,
}));

describe('useServer', () => {
	const mockServerInfo = {
		projectLogoUrl: 'http://test-api.example.com',
	};
	const mockInfoRef = ref(mockServerInfo);

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockUseServerStore.mockReturnValue({
			info: mockInfoRef,
			setInfo: vi.fn(),
		});
	});

	it('returns info ref and setInfo function', () => {
		const { info, setInfo } = useServer();

		expect(info).toBeDefined();
		expect(setInfo).toBeTypeOf('function');
	});

	it('returns server info ref with current value', () => {
		const { info } = useServer();

		expect(info.value).toEqual(mockServerInfo);
		expect(info.value!.projectLogoUrl).toBe('http://test-api.example.com');
	});

	it('returns setInfo function that delegates to store', () => {
		const { setInfo } = useServer();
		const newInfo = {
			projectLogoUrl: 'http://new.example.com',
			projectName: 'Test Project',
			projectColor: '#000000',
			authProviders: [],
			registrationEnabled: false,
		};

		setInfo(newInfo);

		expect(mockUseServerStore).toHaveBeenCalledOnce();
		expect(setInfo).toBeTypeOf('function');
	});

	it('handles null server info', () => {
		mockUseServerStore.mockReturnValue({
			info: ref(null),
			setInfo: vi.fn(),
		});

		const { info } = useServer();

		expect(info.value).toBeNull();
	});

	it('returns refs that stay reactive across calls', () => {
		const { info: info1 } = useServer();
		const { info: info2 } = useServer();

		// Both refs track the same underlying store state
		expect(info1.value).toEqual(info2.value);

		// Updating the store value is reflected in both
		mockInfoRef.value = { projectLogoUrl: 'http://changed.example.com' };

		expect(info1.value).toEqual({ projectLogoUrl: 'http://changed.example.com' });
		expect(info2.value).toEqual({ projectLogoUrl: 'http://changed.example.com' });
	});
});
