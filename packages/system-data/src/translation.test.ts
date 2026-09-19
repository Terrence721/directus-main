import { describe, expectTypeOf, it } from 'vitest';
import type { Translation } from './translation.js';

describe('Translation', () => {
	it('accepts a language/translation pair', () => {
		expectTypeOf<{ language: string; translation: string }>().toExtend<Translation>();
	});

	it('rejects a shape missing translation', () => {
		expectTypeOf<{ language: string }>().not.toExtend<Translation>();
	});
});
