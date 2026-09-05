import { DirectusError } from '../create-error.js';

export interface ForbiddenErrorExtensions {
	reason?: string;
}

export class ForbiddenError extends DirectusError<ForbiddenErrorExtensions> {
	readonly code = 'FORBIDDEN';
	readonly status = 403;

	constructor(extensions: ForbiddenErrorExtensions = {}, options?: ErrorOptions) {
		super(extensions.reason || "You don't have permission to access this.", extensions, options);
	}
}
