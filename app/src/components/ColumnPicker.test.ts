import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ColumnPicker from './ColumnPicker.vue';

const mockFields = [
	{ name: 'id', type: 'uuid' },
	{ name: 'title', type: 'string' },
	{ name: 'created_at', type: 'timestamp' },
];

describe('ColumnPicker', () => {
	it('shows selected columns count in toggle button', () => {
		const wrapper = mount(ColumnPicker, {
			props: { modelValue: ['id'], fields: mockFields },
		});

		expect(wrapper.find('.field-picker__toggle').text()).toContain('1');
	});

	it('toggles field selection on checkbox change', async () => {
		const wrapper = mount(ColumnPicker, {
			props: { modelValue: [], fields: mockFields },
		});

		await wrapper.find('.field-picker__toggle').trigger('click');
		await wrapper.find('.field-item input[type="checkbox"]').trigger('change');

		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toHaveLength(1);
		expect(emitted![0][0]).toEqual(['id']);
	});

	it('deselects field when already selected', async () => {
		const wrapper = mount(ColumnPicker, {
			props: { modelValue: ['id'], fields: mockFields },
		});

		await wrapper.find('.field-picker__toggle').trigger('click');
		await wrapper.find('.field-item input[type="checkbox"]').trigger('change');

		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toHaveLength(1);
		expect(emitted![0][0]).toEqual([]);
	});

	it('selects all available fields', async () => {
		const wrapper = mount(ColumnPicker, {
			props: { modelValue: ['id'], fields: mockFields },
		});

		await wrapper.find('.field-picker__toggle').trigger('click');

		const selectAllBtn = wrapper.find('.field-picker__select-all');
		expect(selectAllBtn.text()).toBe('Select all');

		await selectAllBtn.trigger('click');

		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toHaveLength(1);
		expect(emitted![0][0]).toEqual(['id', 'title', 'created_at']);
	});

	it('deselects all fields when all are selected', async () => {
		const wrapper = mount(ColumnPicker, {
			props: { modelValue: ['id', 'title', 'created_at'], fields: mockFields },
		});

		await wrapper.find('.field-picker__toggle').trigger('click');

		const selectAllBtn = wrapper.find('.field-picker__select-all');
		expect(selectAllBtn.text()).toBe('Deselect all');

		await selectAllBtn.trigger('click');

		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toHaveLength(1);
		expect(emitted![0][0]).toEqual([]);
	});
});
