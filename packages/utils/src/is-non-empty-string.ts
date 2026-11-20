/**
 * Returns true for non-nullish string values whose length is greater than zero.
 * Guards against empty form fields, missing URL parameters, and other "blank
 * but present" inputs without accidentally treating `0` or `false` as strings.
 */
export function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.length > 0;
}
