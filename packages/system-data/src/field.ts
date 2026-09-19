import type { Filter } from './filter.js';
import type { Translation } from './translation.js';

export type FieldTranslations = Translation;

export type Width = 'half' | 'half-left' | 'half-right' | 'full' | 'fill';

/**
 * `rule` is typed as `Filter` here, not the real source's `Record<string, any>` — a condition's
 * rule is always evaluated as a filter against other field values, so the real, already-defined
 * recursive shape is both more accurate and avoids a second, looser type for the same concept.
 */
export interface Condition {
	name: string;
	rule: Filter;
	readonly?: boolean;
	hidden?: boolean;
	options?: Record<string, unknown>;
	required?: boolean;
	clear_hidden_value_on_save?: boolean;
}

export interface FieldMeta {
	id: number;
	collection: string;
	field: string;
	group: string | null;
	hidden: boolean;
	interface: string | null;
	display: string | null;
	options: Record<string, unknown> | null;
	display_options: Record<string, unknown> | null;
	readonly: boolean;
	required: boolean;
	sort: number | null;
	special: string[] | null;
	translations: FieldTranslations[] | null;
	width: Width | null;
	note: string | null;
	clear_hidden_value_on_save?: boolean;
	conditions: Condition[] | null;
	validation: Filter | null;
	validation_message: string | null;
	searchable: boolean;
	system?: true;
}
