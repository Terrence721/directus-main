import { isNonEmptyString } from '@directus/utils';

/**
 * Validation error types for registration.
 */
export interface RegisterValidationError {
	field: 'email' | 'password' | 'firstName' | 'lastName';
	message: string;
}

/**
 * Validates registration data and returns any validation errors.
 *
 * @param data - The registration data to validate
 * @returns Array of validation errors, or empty array if valid
 */
export function validateRegister(data: {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
}): RegisterValidationError[] {
	const errors: RegisterValidationError[] = [];

	// Email validation
	if (!isNonEmptyString(data.email)) {
		errors.push({ field: 'email', message: 'Email is required.' });
	}

	// Password validation
	if (!isNonEmptyString(data.password)) {
		errors.push({ field: 'password', message: 'Password is required.' });
	} else if (data.password.length < 6) {
		errors.push({ field: 'password', message: 'Password must be at least 6 characters.' });
	}

	// First name validation (optional, but if provided must be non-empty)
	if (data.firstName !== undefined && !isNonEmptyString(data.firstName)) {
		errors.push({ field: 'firstName', message: 'First name must not be empty.' });
	}

	// Last name validation (optional, but if provided must be non-empty)
	if (data.lastName !== undefined && !isNonEmptyString(data.lastName)) {
		errors.push({ field: 'lastName', message: 'Last name must not be empty.' });
	}

	return errors;
}
