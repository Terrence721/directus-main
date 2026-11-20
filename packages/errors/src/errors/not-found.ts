import { DirectusError } from '../create-error.js';

export class NotFoundError extends DirectusError<void> {
	readonly code = 'NOT_FOUND';
	readonly status = 404;

	constructor(message = 'Resource not found.', options?: ErrorOptions) {
		super(message, undefined, options);
	}
}
