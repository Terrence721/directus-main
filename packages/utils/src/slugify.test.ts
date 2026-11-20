import { describe, expect, it } from 'vitest';
import { slugify } from './slugify.js';

describe('slugify', () => {
	it('lowercases and replaces spaces with hyphens', () => {
		expect(slugify('Hello World')).toBe('hello-world');
	});

	it('strips special characters', () => {
		expect(slugify("It's a beautiful day!")).toBe('its-a-beautiful-day');
	});

	it('collapses consecutive hyphens', () => {
		expect(slugify('foo  --  bar')).toBe('foo-bar');
	});

	it('strips leading and trailing hyphens', () => {
		expect(slugify('---hello---')).toBe('hello');
	});

	it('handles already-slug-case input', () => {
		expect(slugify('already-a-slug')).toBe('already-a-slug');
	});

	it('returns empty string for whitespace-only input', () => {
		expect(slugify('   ')).toBe('');
	});

	it('handles unicode characters by stripping them', () => {
		expect(slugify('café')).toBe('caf');
	});

	it('preserves alphanumeric characters', () => {
		expect(slugify('Item #42')).toBe('item-42');
	});

	it('handles hyphens in the source without duplication', () => {
		expect(slugify('my-project-name')).toBe('my-project-name');
	});
});
