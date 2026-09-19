import { describe, expectTypeOf, it } from 'vitest';
import type { Condition, FieldMeta, FieldTranslations, Width } from './field.js';
import type { Translation } from './translation.js';

describe('FieldTranslations', () => {
	it('is the exact same shape as Translation', () => {
		expectTypeOf<Translation>().toEqualTypeOf<FieldTranslations>();
	});
});

describe('Width', () => {
	it('accepts each of the five real values', () => {
		expectTypeOf<'half'>().toExtend<Width>();
		expectTypeOf<'half-left'>().toExtend<Width>();
		expectTypeOf<'half-right'>().toExtend<Width>();
		expectTypeOf<'full'>().toExtend<Width>();
		expectTypeOf<'fill'>().toExtend<Width>();
	});

	it('rejects a value outside the five real widths', () => {
		expectTypeOf<'third'>().not.toExtend<Width>();
	});
});

describe('Condition', () => {
	it('accepts a real filter as the rule', () => {
		expectTypeOf<{ name: string; rule: { status: { _eq: string } } }>().toExtend<Condition>();
	});

	it('rejects a rule with a bare value, not filter-shaped', () => {
		// A plain string would also fail Record<string, unknown>-style typing for an unrelated
		// reason (not being an object at all), which wouldn't actually prove Filter adds anything
		// over a looser Record type. This counter-example is a real object, just not Filter-shaped.
		expectTypeOf<{ name: string; rule: { foo: 123 } }>().not.toExtend<Condition>();
	});
});

describe('FieldMeta', () => {
	it('accepts a full field metadata record', () => {
		expectTypeOf<{
			id: number;
			collection: string;
			field: string;
			group: null;
			hidden: boolean;
			interface: null;
			display: null;
			options: null;
			display_options: null;
			readonly: boolean;
			required: boolean;
			sort: null;
			special: null;
			translations: null;
			width: null;
			note: null;
			conditions: null;
			validation: null;
			validation_message: null;
			searchable: boolean;
		}>().toExtend<FieldMeta>();
	});
});
