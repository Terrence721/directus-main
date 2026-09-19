import { describe, expect, it } from 'vitest';
import { defineModule } from './defineModule.js';

describe('defineModule', () => {
	it('returns the exact same config reference it was given', () => {
		const config = { id: 'probe', name: 'Probe', icon: 'bug_report', routes: [] };

		expect(defineModule(config)).toBe(config);
	});

	it('preserves the optional hidden flag when present', () => {
		const config = { id: 'probe', name: 'Probe', icon: 'bug_report', routes: [], hidden: true };

		expect(defineModule(config).hidden).toBe(true);
	});

	it('leaves the optional hidden flag undefined when omitted', () => {
		const config = { id: 'probe', name: 'Probe', icon: 'bug_report', routes: [] };

		expect(defineModule(config).hidden).toBeUndefined();
	});
});
