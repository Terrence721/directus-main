/**
 * Type guard that returns true when `value` is a valid email address.
 * Uses a reasonable regex pattern that matches most valid email formats
 * while rejecting obviously invalid ones.
 *
 * Note: This is a client-side validation helper. Server-side validation
 * should also be performed for security.
 *
 * @example
 * isEmail('test@example.com')    // true
 * isEmail('user.name@domain.co.uk') // true
 * isEmail('invalid-email')       // false
 * isEmail('@example.com')        // false
 * isEmail('test@')               // false
 */
export function isEmail(value: unknown): value is string {
	if (typeof value !== 'string') return false;

	// Basic structure validation: local-part@domain.tld
	// Requires: non-empty local part, @ separator, domain with at least one dot,
	// no consecutive dots, no leading/trailing dots in each segment
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
		return false;
	}

	// Reject consecutive dots anywhere in the email
	if (/\.\./.test(value)) {
		return false;
	}

	// Reject leading or trailing dots in local part or domain segments
	const parts = value.split('@');
	if (parts.length !== 2) return false;
	const [local, domain] = parts;
	if (/^\.|\.$/.test(local) || /^\.|\.$/.test(domain)) return false;

	// Reject TLD that is too short (minimum 2 characters)
	const tld = domain.split('.').pop();
	if (!tld || tld.length < 2) return false;

	return true;
}
