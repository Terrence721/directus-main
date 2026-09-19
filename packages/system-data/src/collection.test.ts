import { describe, expectTypeOf, it } from 'vitest';
import type { BaseCollectionMeta, CollectionMeta, CollectionTranslations, DataCollectionMeta } from './collection.js';

describe('CollectionTranslations', () => {
	it('accepts a full translation record', () => {
		expectTypeOf<{
			language: string;
			translation: string;
			singular: string;
			plural: string;
		}>().toExtend<CollectionTranslations>();
	});

	it('rejects a plain Translation missing singular/plural', () => {
		expectTypeOf<{ language: string; translation: string }>().not.toExtend<CollectionTranslations>();
	});
});

describe('CollectionMeta', () => {
	it('accepts a full collection metadata record', () => {
		expectTypeOf<{
			collection: string;
			note: null;
			hidden: boolean;
			singleton: boolean;
			icon: null;
			color: null;
			translations: null;
			display_template: null;
			preview_url: null;
			versioning: boolean;
			autosave_revision_interval: null;
			sort_field: null;
			archive_field: null;
			archive_value: null;
			unarchive_value: null;
			archive_app_filter: boolean;
			item_duplication_fields: null;
			accountability: null;
			system: null;
			sort: null;
			group: null;
			collapse: 'open';
			status: 'active';
		}>().toExtend<CollectionMeta>();
	});
});

describe('BaseCollectionMeta', () => {
	it('excludes fields not in the picked subset, like color', () => {
		expectTypeOf<BaseCollectionMeta>().not.toHaveProperty('color');
	});

	it('keeps the picked fields, like accountability', () => {
		expectTypeOf<BaseCollectionMeta>().toHaveProperty('accountability');
	});
});

describe('DataCollectionMeta', () => {
	it('requires only collection and note', () => {
		expectTypeOf<{ collection: string; note: string | null }>().toExtend<DataCollectionMeta>();
	});

	it('rejects a record missing note', () => {
		expectTypeOf<{ collection: string }>().not.toExtend<DataCollectionMeta>();
	});
});
