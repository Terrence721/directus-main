import { describe, expect, it } from 'vitest';
import UsersModule from './index.js';
import UserManagement from './routes/collection.vue';

describe('Users Module', () => {
	it('exports a module with correct properties', () => {
		expect(UsersModule.id).toBe('users');
		expect(UsersModule.name).toBe('Users');
		expect(UsersModule.icon).toBe('👤');
	});

	it('defines a single route to the user management view', () => {
		expect(UsersModule.routes).toHaveLength(1);
		expect(UsersModule.routes[0].name).toBe('index');
		expect(UsersModule.routes[0].path).toBe('');
		expect(UsersModule.routes[0].component).toBe(UserManagement);
	});
});
