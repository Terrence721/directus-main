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

/**
 * Validation error types for user profile updates.
 */
export interface PatchUserValidationError {
	field: 'firstName' | 'lastName' | 'email' | 'password';
	message: string;
}

/**
 * Validates user profile update data (PATCH /users/me).
 * All fields are optional, but if provided they must pass validation.
 *
 * @param data - The patch data to validate
 * @returns Array of validation errors, or empty array if valid
 */
export function validatePatchUser(data: {
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	password?: string;
}): PatchUserValidationError[] {
	const errors: PatchUserValidationError[] = [];

	// First name validation (can be null to clear)
	if (data.firstName !== undefined && data.firstName !== null && !isNonEmptyString(data.firstName)) {
		errors.push({ field: 'firstName', message: 'First name must not be empty.' });
	}

	// Last name validation (can be null to clear)
	if (data.lastName !== undefined && data.lastName !== null && !isNonEmptyString(data.lastName)) {
		errors.push({ field: 'lastName', message: 'Last name must not be empty.' });
	}

	// Email validation (must be non-empty if provided)
	if (data.email !== undefined && !isNonEmptyString(data.email)) {
		errors.push({ field: 'email', message: 'Email is required.' });
	}

	// Password validation (must be at least 6 chars if provided)
	if (data.password !== undefined && data.password.length < 6) {
		errors.push({ field: 'password', message: 'Password must be at least 6 characters.' });
	}

	return errors;
}
