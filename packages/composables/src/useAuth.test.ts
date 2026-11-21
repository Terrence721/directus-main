import { describe, expect, it, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuth } from './useAuth.js';

beforeEach(() => {
	setActivePinia(createPinia());
	vi.clearAllMocks();
});

describe('useAuth', () => {
	it('provides the auth store state', () => {
		const { loggedIn, session, setSession, clearSession } = useAuth();
		expect(loggedIn).toBe(false);
		expect(session).toBeNull();
		expect(setSession).toBeTypeOf('function');
		expect(clearSession).toBeTypeOf('function');
	});
});