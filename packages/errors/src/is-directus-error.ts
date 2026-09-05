import { DirectusError } from './create-error.js';

export function isDirectusError(value: unknown, code?: string): value is DirectusError {
	return value instanceof DirectusError && (code === undefined || value.code === code);
}
