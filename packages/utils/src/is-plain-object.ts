/**
 * Returns true when `value` is a plain object — created by `{}` or `new Object()` —
 * and not an array, Date, RegExp, null, primitive, or class instance. Useful for
 * discriminating request body shapes, configuration objects, and data records
 * that must be key-value maps rather than anything else.
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (value === null || typeof value !== 'object') return false;

	const proto = Object.getPrototypeOf(value);

	return proto === Object.prototype || proto === null;
}
