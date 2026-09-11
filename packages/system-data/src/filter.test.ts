import { describe, expectTypeOf, it } from 'vitest';
import type { FieldFilter, FieldFilterOperator, FieldValidationOperator, LogicalFilter } from './filter.js';

describe('LogicalFilter', () => {
	it('accepts a logical AND of nested filters', () => {
		expectTypeOf<{ _and: FieldFilter[] }>().toExtend<LogicalFilter>();
	});

	it('accepts a logical OR of nested filters', () => {
		expectTypeOf<{ _or: FieldFilter[] }>().toExtend<LogicalFilter>();
	});
});

describe('FieldFilter', () => {
	it('accepts a field filter keyed by field name', () => {
		expectTypeOf<{ title: { _eq: string } }>().toExtend<FieldFilter>();
	});

	it('accepts nested field filters for relational fields', () => {
		expectTypeOf<{ author: { name: { _eq: string } } }>().toExtend<FieldFilter>();
	});
});

describe('FieldFilterOperator', () => {
	it('accepts a between operator with exactly two bounds', () => {
		expectTypeOf<{ _between: [number, number] }>().toExtend<FieldFilterOperator>();
	});

	it('rejects a between operator with the wrong arity', () => {
		expectTypeOf({ _between: [1, 2, 3] as [number, number, number] }).not.toExtend<FieldFilterOperator>();
	});
});

describe('FieldValidationOperator', () => {
	it('accepts a validation-only operator', () => {
		expectTypeOf<{ _regex: string }>().toExtend<FieldValidationOperator>();
	});
});
