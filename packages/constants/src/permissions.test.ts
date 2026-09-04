import { describe, expect, it } from 'vitest';
import { PERMISSION_ACTIONS } from './permissions.js';

describe('PERMISSION_ACTIONS', () => {
	it('contains exactly the five CRUD+share actions, in order', () => {
		expect(PERMISSION_ACTIONS).toEqual(['create', 'read', 'update', 'delete', 'share']);
	});
});
