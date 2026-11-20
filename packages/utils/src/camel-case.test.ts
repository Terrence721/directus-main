import { describe, expect, it } from 'vitest';
import { camelCase } from './camel-case.js';

describe('camelCase', () => {
	it('lowercases a single word', () => {
		expect(camelCase('Title')).toBe('title');
		expect(camelCase('hello')).toBe('hello');
	});

	it('joins segments in camelCase', () => {
		expect(camelCase('user_name')).toBe('userName');
		expect(camelCase('user-name')).toBe('userName');
		expect(camelCase('user name')).toBe('userName');
	});

	it('handles leading and trailing separators', () => {
		expect(camelCase('_user_name_')).toBe('userName');
		expect(camelCase('  user  name  ')).toBe('userName');
	});

	it('preserves digits within a segment', () => {
		expect(camelCase('user_2_id')).toBe('user2Id');
		expect(camelCase('item_123_name')).toBe('item123Name');
	});

	it('returns an empty string for an empty input', () => {
		expect(camelCase('')).toBe('');
	});

	it('returns an empty string for separators only', () => {
		expect(camelCase('___')).toBe('');
		expect(camelCase('   ')).toBe('');
	});
});
