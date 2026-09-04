import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useUserStore } from './user.js';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('useUserStore', () => {
	it('starts with no user', () => {
		const store = useUserStore();

		expect(store.user).toBeNull();
		expect(store.fullName).toBeNull();
		expect(store.initials).toBeNull();
	});

	it('derives fullName and initials from first/last name', () => {
		const store = useUserStore();

		store.setUser({
			id: '1',
			email: 'jane.doe@example.com',
			firstName: 'Jane',
			lastName: 'Doe',
			avatarUrl: null,
		});

		expect(store.fullName).toBe('Jane Doe');
		expect(store.initials).toBe('JD');
	});

	it('falls back to email when no name is set', () => {
		const store = useUserStore();

		store.setUser({
			id: '2',
			email: 'noname@example.com',
			firstName: null,
			lastName: null,
			avatarUrl: null,
		});

		expect(store.fullName).toBe('noname@example.com');
		expect(store.initials).toBe('N');
	});

	it('handles only a first or only a last name', () => {
		const store = useUserStore();

		store.setUser({ id: '3', email: 'jane@example.com', firstName: 'Jane', lastName: null, avatarUrl: null });

		expect(store.fullName).toBe('Jane');
		expect(store.initials).toBe('J');
	});

	it('clears the user', () => {
		const store = useUserStore();

		store.setUser({ id: '4', email: 'jane@example.com', firstName: 'Jane', lastName: 'Doe', avatarUrl: null });
		store.clearUser();

		expect(store.user).toBeNull();
	});
});
