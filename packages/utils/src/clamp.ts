/**
 * Clamps a number to the inclusive range `[min, max]`. Returns `min` when
 * `value` is below it, `max` when above it, and the value unchanged otherwise.
 *
 * @example
 * clamp(5, 0, 10)  // 5
 * clamp(-3, 0, 10) // 0
 * clamp(99, 0, 10) // 10
 */
export function clamp(value: number, min: number, max: number): number {
	if (value < min) return min;
	if (value > max) return max;
	return value;
}
