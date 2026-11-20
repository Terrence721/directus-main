/**
 * Converts a string to camelCase: lowercases the first segment, capitalizes the
 * first letter of every subsequent segment, and joins them. Segments are
 * separated by spaces, underscores, hyphens, or any non-alphanumeric run.
 *
 * Edge cases:
 * - Empty string returns an empty string.
 * - A single word is lowercased as-is (`"Title"` → `"title"`).
 * - Numbers are preserved as part of their segment (`"user_2_id"` → `"userId"`).
 */
export function camelCase(value: string): string {
	if (value.length === 0) return '';

	const segments = value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim()
		.split(' ')
		.filter((segment) => segment.length > 0);

	if (segments.length === 0) return '';

	return segments
		.map((segment, index) => {
			if (index === 0) return segment;
			return segment.charAt(0).toUpperCase() + segment.slice(1);
		})
		.join('');
}
