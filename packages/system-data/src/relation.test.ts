import { describe, expectTypeOf, it } from 'vitest';
import type { RelationMeta } from './relation.js';

describe('RelationMeta', () => {
	it('accepts a full relation metadata record', () => {
		expectTypeOf<{
			id: number;
			many_collection: string;
			many_field: string;
			one_collection: string | null;
			one_field: string | null;
			one_collection_field: string | null;
			one_allowed_collections: string[] | null;
			one_deselect_action: 'nullify' | 'delete';
			junction_field: string | null;
			sort_field: string | null;
		}>().toExtend<RelationMeta>();
	});

	it('rejects a deselect action outside the two real values', () => {
		expectTypeOf<{
			id: number;
			many_collection: string;
			many_field: string;
			one_collection: null;
			one_field: null;
			one_collection_field: null;
			one_allowed_collections: null;
			one_deselect_action: 'cascade';
			junction_field: null;
			sort_field: null;
		}>().not.toExtend<RelationMeta>();
	});
});
