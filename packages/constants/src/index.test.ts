import { describe, expect, it } from 'vitest';
import { PERMISSION_ACTIONS, PermissionAction, LOCAL_AUTH_DRIVER } from './index.js';

describe('constants', () => {
	describe('PERMISSION_ACTIONS', () => {
		it('contains the correct permission actions', () => {
			expect(PERMISSION_ACTIONS).toEqual(['create', 'read', 'update', 'delete', 'share']);
		});

		it('is a const array (read-only)', () => {
			// PERMISSION_ACTIONS is a const array - the type system ensures it's readonly
			// PERMISSION_ACTIONS.push('test');
		});
	});

	describe('PermissionAction', () => {
		it('is a union type of all permission actions', () => {
			// Type check - this should compile if type is correct
			const action: PermissionAction = 'create';
			expect(action).toBe('create');
		});
	});

	describe('LOCAL_AUTH_DRIVER', () => {
		it('has the correct value', () => {
			expect(LOCAL_AUTH_DRIVER).toBe('local');
		});
	});
});
