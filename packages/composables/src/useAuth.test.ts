import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuth } from './useAuth.ts';

beforeEach(() => {
	setActivePinia(createPinia());
	vi.clearAllMocks();
});

describe('useAuth', () => {
	it('provides the auth store state', () => {
		const { loggedIn, session, setSession, clearSession } = useAuth();
		expect(loggedIn.value).toBe(false);
		expect(session.value).toBeNull();
		expect(setSession).toBeTypeOf('function');
		expect(clearSession).toBeTypeOf('function');
	});
});
