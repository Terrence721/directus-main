import type { Translation } from './translation.js';

export type CollectionTranslations = Translation & {
	singular: string;
	plural: string;
};

export interface CollectionMeta {
	collection: string;
	note: string | null;
	hidden: boolean;
	singleton: boolean;
	icon: string | null;
	color: string | null;
	translations: CollectionTranslations[] | null;
	display_template: string | null;
	preview_url: string | null;
	versioning: boolean;
	autosave_revision_interval: number | null;
	sort_field: string | null;
	archive_field: string | null;
	archive_value: string | null;
	unarchive_value: string | null;
	archive_app_filter: boolean;
	item_duplication_fields: string[] | null;
	accountability: 'all' | 'activity' | null;
	system: boolean | null;
	sort: number | null;
	group: string | null;
	collapse: 'open' | 'closed' | 'locked';
	status: 'active' | 'inactive';
}

export type BaseCollectionMeta = Pick<
	CollectionMeta,
	| 'collection'
	| 'note'
	| 'hidden'
	| 'singleton'
	| 'icon'
	| 'translations'
	| 'versioning'
	| 'autosave_revision_interval'
	| 'item_duplication_fields'
	| 'accountability'
	| 'group'
	| 'system'
	| 'status'
>;

export type DataCollectionMeta = Partial<BaseCollectionMeta> & Pick<BaseCollectionMeta, 'collection' | 'note'>;
