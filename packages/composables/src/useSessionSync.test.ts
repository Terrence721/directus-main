import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createApp, nextTick } from 'vue';
import { initSessionSync } from './useSessionSync';

const { useAuthStore: mockUseAuthStore } = vi.hoisted(() => ({
	useAuthStore: vi.fn(),
}));

vi.mock('@directus/stores', () => ({
	useAuthStore: mockUseAuthStore,
}));

describe('initSessionSync', () => {
	const mockClearSession = vi.fn();
	const mockSetSession = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockUseAuthStore.mockReturnValue({
			clearSession: mockClearSession,
			setSession: mockSetSession,
		});
	});

	it('adds a storage event listener when called inside a component setup', async () => {
		const addListenerSpy = vi.spyOn(window, 'addEventListener');

		const app = createApp({
			setup() {
				initSessionSync();
				return {};
			},
		});

		app.mount(document.createElement('div'));
		await nextTick();

		expect(addListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

		addListenerSpy.mockRestore();
	});

	it('removes the storage event listener when component unmounts', async () => {
		const removeListenerSpy = vi.spyOn(window, 'removeEventListener');

		const app = createApp({
			setup() {
				initSessionSync();
				return {};
			},
		});

		const el = document.createElement('div');
		app.mount(el);
		await nextTick();

		app.unmount();
		await nextTick();

		expect(removeListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));

		removeListenerSpy.mockRestore();
	});

	it('does nothing when storage event key does not match', () => {
		initSessionSync();

		const event = new StorageEvent('storage', { key: 'other-key', newValue: 'test' });
		window.dispatchEvent(event);

		expect(mockClearSession).not.toHaveBeenCalled();
		expect(mockSetSession).not.toHaveBeenCalled();
	});

	it('calls clearSession when storage event has no new value and no current session', () => {
		initSessionSync();

		const event = new StorageEvent('storage', {
			key: 'directus-main-session',
			newValue: null,
		});
		window.dispatchEvent(event);

		expect(mockClearSession).toHaveBeenCalledOnce();
		expect(mockSetSession).not.toHaveBeenCalled();
	});
});
