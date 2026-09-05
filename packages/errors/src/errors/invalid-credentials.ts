import { DirectusError } from '../create-error.js';

/**
 * No `reason` extension by design: revealing whether it was the email or the password that was
 * wrong would let an attacker enumerate valid accounts. The message stays generic on purpose.
 */
export class InvalidCredentialsError extends DirectusError<void> {
	readonly code = 'INVALID_CREDENTIALS';
	readonly status = 401;

	constructor(options?: ErrorOptions) {
		super('Invalid user credentials.', undefined, options);
	}
}
