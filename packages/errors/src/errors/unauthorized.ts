import { DirectusError } from '../create-error.js';

export class UnauthorizedError extends DirectusError<void> {
	readonly code = 'UNAUTHORIZED';
	readonly status = 401;

	constructor(options?: ErrorOptions) {
		super('Session invalid or expired.', undefined, options);
	}
}
