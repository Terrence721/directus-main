export type Filter = LogicalFilter | FieldFilter;

export type LogicalFilter = { _and: Filter[] } | { _or: Filter[] };

export type FieldFilter = {
	[field: string]: FieldFilterOperator | FieldValidationOperator | FieldFilter;
};

/**
 * `_between`/`_nbetween` are tightened to a 2-tuple here, unlike the real source's unbounded
 * array — "between" always takes exactly two bounds, and the looser type let a caller pass one,
 * three, or more values with nothing catching it.
 */
export interface FieldFilterOperator {
	_eq?: string | number | boolean;
	_neq?: string | number | boolean;
	_lt?: string | number;
	_lte?: string | number;
	_gt?: string | number;
	_gte?: string | number;
	_in?: (string | number)[];
	_nin?: (string | number)[];
	_null?: boolean;
	_nnull?: boolean;
	_contains?: string;
	_ncontains?: string;
	_icontains?: string;
	_starts_with?: string;
	_nstarts_with?: string;
	_istarts_with?: string;
	_nistarts_with?: string;
	_ends_with?: string;
	_nends_with?: string;
	_iends_with?: string;
	_niends_with?: string;
	_between?: [string | number, string | number];
	_nbetween?: [string | number, string | number];
	_empty?: boolean;
	_nempty?: boolean;
	_intersects?: string;
	_nintersects?: string;
	_intersects_bbox?: string;
	_nintersects_bbox?: string;
}

export interface FieldValidationOperator {
	_submitted?: boolean;
	_regex?: string;
}
