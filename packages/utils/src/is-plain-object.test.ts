import { describe, expect, it } from 'vitest';
import { isPlainObject } from './is-plain-object.js';

describe('isPlainObject', () => {
	it('returns true for a plain object literal', () => {
		expect(isPlainObject({})).toBe(true);
		expect(isPlainObject({ a: 1 })).toBe(true);
	});

	it('returns false for an array', () => {
		expect(isPlainObject([])).toBe(false);
		expect(isPlainObject([1, 2])).toBe(false);
	});

	it('returns false for null', () => {
		expect(isPlainObject(null)).toBe(false);
	});

	it('returns false for primitives', () => {
		expect(isPlainObject('hello')).toBe(false);
		expect(isPlainObject(42)).toBe(false);
		expect(isPlainObject(true)).toBe(false);
		expect(isPlainObject(undefined)).toBe(false);
	});

	it('returns false for a Date', () => {
		expect(isPlainObject(new Date())).toBe(false);
	});

	it('returns false for a RegExp', () => {
		expect(isPlainObject(/abc/)).toBe(false);
	});

	it('returns false for a class instance', () => {
		class Foo {}
		expect(isPlainObject(new Foo())).toBe(false);
	});

	it('returns false for Object.create(null)', () => {
		expect(isPlainObject(Object.create(null))).toBe(true);
	});

	it('returns true for Object.assign target', () => {
		expect(isPlainObject(Object.assign({}, { a: 1 }))).toBe(true);
	});

	it('returns true for nested plain objects', () => {
		expect(isPlainObject({ nested: { deep: true } })).toBe(true);
	});
});
