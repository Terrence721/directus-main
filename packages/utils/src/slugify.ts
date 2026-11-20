/**
 * Converts a human-readable string into a URL-safe slug: lowercased,
 * non-alphanumeric characters replaced with hyphens, consecutive hyphens
 * collapsed, and leading/trailing hyphens stripped.
 *
 * Useful for generating slugs from titles, names, or any free-form text
 * destined for URLs or file paths.
 */
export function slugify(value: string): string {
	return value
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '');
}
