import { describe, expectTypeOf, it } from 'vitest';
import type { DataPermission, Permission, PermissionsAction } from './permission.js';

describe('PermissionsAction', () => {
	it('accepts each of the five real actions', () => {
		expectTypeOf<'create'>().toExtend<PermissionsAction>();
		expectTypeOf<'read'>().toExtend<PermissionsAction>();
		expectTypeOf<'update'>().toExtend<PermissionsAction>();
		expectTypeOf<'delete'>().toExtend<PermissionsAction>();
		expectTypeOf<'share'>().toExtend<PermissionsAction>();
	});

	it('rejects an action outside the five real values', () => {
		expectTypeOf<'archive'>().not.toExtend<PermissionsAction>();
	});
});

describe('Permission', () => {
	it('accepts a full permission record', () => {
		expectTypeOf<{
			policy: string | null;
			collection: string;
			action: PermissionsAction;
			permissions: null;
			validation: null;
			presets: null;
			fields: string[] | null;
		}>().toExtend<Permission>();
	});

	it('rejects an action outside the five real values', () => {
		expectTypeOf<{
			policy: null;
			collection: string;
			action: 'archive';
			permissions: null;
			validation: null;
			presets: null;
			fields: null;
		}>().not.toExtend<Permission>();
	});
});

describe('DataPermission', () => {
	it('requires only collection and action', () => {
		expectTypeOf<{ collection: string; action: PermissionsAction }>().toExtend<DataPermission>();
	});

	it('rejects a record missing action', () => {
		expectTypeOf<{ collection: string }>().not.toExtend<DataPermission>();
	});
});
