/**
 * The real source declares CollectionTranslations and FieldTranslations as two independent
 * shapes, even though FieldTranslations is a strict subset of CollectionTranslations's first two
 * fields. Extracted here so collection.ts/field.ts compose it instead of each restating it.
 */
export interface Translation {
	language: string;
	translation: string;
}
