import { describe, expect, it, vi, beforeEach } from 'vitest';
import { initSessionSync } from './useSessionSync';
import { setActivePinia, createPinia } from 'pinia';
import { mount } from '@vue/test-utils';

const mockUseAuthStore = vi.hoisted(() => vi.fn());
vi.mock('@directus/stores', () => ({
	useAuthStore: mockUseAuthStore,
}));

const mockAddEventListener = vi.hoisted(() => vi.fn());
const mockRemoveEventListener = vi.hoisted(() => vi.fn());

// Mock window object
globalThis.window = {
	addEventListener: mockAddEventListener,
	removeEventListener: mockRemoveEventListener,
} as unknown as Window & typeof globalThis;

describe('useSessionSync', () => {
	const mockAuthStore = {
		clearSession: vi.fn(),
		setSession: vi.fn(),
	};

	beforeEach(() => {
		setActivePinia(createPinia());
		vi.clearAllMocks();
		mockUseAuthStore.mockReturnValue(mockAuthStore);
		mockAddEventListener.mockClear();
		mockRemoveEventListener.mockClear();

		// Reset the session cookie between tests using the browser cookie API.
		document.cookie = 'directus-main-session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
	});

	it('adds storage event listener on mount', () => {
		mount({
			setup() {
				initSessionSync();
			},
		});

		expect(mockAddEventListener).toHaveBeenCalledOnce();
		expect(mockAddEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
	});

	it('removes storage event listener on unmount', () => {
		const wrapper = mount({
			setup() {
				initSessionSync();
			},
		});

		wrapper.unmount();

		expect(mockRemoveEventListener).toHaveBeenCalledOnce();
		expect(mockRemoveEventListener).toHaveBeenCalledWith('storage', expect.any(Function));
	});

	it('clears session when storage event has newValue null and cookie is null', () => {
		mount({
			setup() {
				initSessionSync();
			},
		});

		const storageHandler = mockAddEventListener.mock.calls[0][1];

		const mockEvent = {
			key: 'directus-main-session',
			newValue: null,
		} as StorageEvent;

		storageHandler(mockEvent);

		expect(mockUseAuthStore).toHaveBeenCalled();
		expect(mockAuthStore.clearSession).toHaveBeenCalledOnce();
	});

	it('does nothing when storage event key is not directus-main-session', () => {
		mount({
			setup() {
				initSessionSync();
			},
		});

		const storageHandler = mockAddEventListener.mock.calls[0][1];
		const authStoreCallsBeforeEvent = mockUseAuthStore.mock.calls.length;

		const mockEvent = {
			key: 'other-key',
			newValue: 'value',
		} as StorageEvent;

		storageHandler(mockEvent);

		// The handler should return before accessing the auth store when the key does not match.
		expect(mockUseAuthStore.mock.calls).toHaveLength(authStoreCallsBeforeEvent);
		expect(mockAuthStore.clearSession).not.toHaveBeenCalled();
		expect(mockAuthStore.setSession).not.toHaveBeenCalled();
	});

	it('does nothing when storage event has newValue and cookie is null', () => {
		mount({
			setup() {
				initSessionSync();
			},
		});

		const storageHandler = mockAddEventListener.mock.calls[0][1];

		const mockEvent = {
			key: 'directus-main-session',
			newValue: '{"accessToken":"token123","expiresAt":12345}',
		} as StorageEvent;

		storageHandler(mockEvent);

		// When cookie is null but storage event has newValue, it does nothing
		// because logic checks "else if (current !== null)" and current is null
		expect(mockAuthStore.setSession).not.toHaveBeenCalled();
		expect(mockAuthStore.clearSession).not.toHaveBeenCalled();
	});

	it('syncs session from cookie when cookie has valid session', () => {
		// Provide a deterministic cookie value for the handler's readCookie().
		// The source regex is /(?:^|;) directus-main-session=.../, so the cookie
		// must be preceded by "; " (as it would be in a real document.cookie string).
		vi.spyOn(document, 'cookie', 'get').mockReturnValue(
			'other=value; directus-main-session={"accessToken":"token456","expiresAt":7890}',
		);

		mount({
			setup() {
				initSessionSync();
			},
		});

		const storageHandler = mockAddEventListener.mock.calls[0][1];

		const mockEvent = {
			key: 'directus-main-session',
			newValue: '{"accessToken":"token123","expiresAt":12345}',
		} as StorageEvent;

		storageHandler(mockEvent);

		// Should sync from cookie, not storage event
		expect(mockUseAuthStore).toHaveBeenCalled();
		expect(mockAuthStore.setSession).toHaveBeenCalledOnce();
		expect(mockAuthStore.setSession).toHaveBeenCalledWith('token456', 7890);
	});
});
