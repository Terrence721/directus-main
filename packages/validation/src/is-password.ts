/**
 * Type guard that returns true when `value` is a strong password.
 * Enforces: minimum 8 characters, at least one lowercase, one uppercase,
 * one digit, and one special character.
 *
 * Note: This is a client-side validation helper. Server-side validation
 * should also be performed for security.
 *
 * @example
 * isPassword('Weak')        // false
 * isPassword('Strong1!')    // true
 * isPassword('P@ssw0rd')    // true
 * isPassword('password')    // false
 */
export function isPassword(value: unknown): value is string {
	if (typeof value !== 'string') return false;

	if (value.length < 8) return false;

	const hasLower = /[a-z]/.test(value);
	const hasUpper = /[A-Z]/.test(value);
	const hasDigit = /[0-9]/.test(value);
	const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]/.test(value);

	return hasLower && hasUpper && hasDigit && hasSpecial;
}
