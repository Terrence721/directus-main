import { describe, expect, it } from 'vitest';
import { clamp } from './clamp.js';

describe('clamp', () => {
	it('returns the value when it is within the range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(0, 0, 10)).toBe(0);
		expect(clamp(10, 0, 10)).toBe(10);
	});

	it('returns min when the value is below the range', () => {
		expect(clamp(-3, 0, 10)).toBe(0);
	});

	it('returns max when the value is above the range', () => {
		expect(clamp(99, 0, 10)).toBe(10);
	});

	it('works with negative bounds', () => {
		expect(clamp(-15, -20, -5)).toBe(-15);
		expect(clamp(-30, -20, -5)).toBe(-20);
		expect(clamp(0, -20, -5)).toBe(-5);
	});

	it('works when min equals max', () => {
		expect(clamp(5, 7, 7)).toBe(7);
		expect(clamp(100, 7, 7)).toBe(7);
	});
});
