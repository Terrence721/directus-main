import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CollectionSelector from './CollectionSelector.vue';

const mockCollection = {
	id: 'posts',
	label: 'Posts',
	sampleCount: 42,
};

describe('CollectionSelector', () => {
	it('renders the collection label', () => {
		const wrapper = mount(CollectionSelector, {
			props: { collection: mockCollection, selected: false },
		});

		expect(wrapper.text()).toContain('Posts');
	});

	it('renders the sample count', () => {
		const wrapper = mount(CollectionSelector, {
			props: { collection: mockCollection, selected: false },
		});

		expect(wrapper.text()).toContain('42');
	});

	it('applies the inactive class by default', () => {
		const wrapper = mount(CollectionSelector, {
			props: { collection: mockCollection, selected: false },
		});

		expect(wrapper.classes()).not.toContain('coll-group--active');
	});

	it('applies the active class when selected', () => {
		const wrapper = mount(CollectionSelector, {
			props: { collection: mockCollection, selected: true },
		});

		expect(wrapper.classes()).toContain('coll-group--active');
	});

	it('emits click when the button is clicked', async () => {
		const wrapper = mount(CollectionSelector, {
			props: { collection: mockCollection, selected: false },
		});

		await wrapper.find('button').trigger('click');

		expect(wrapper.emitted('click')).toHaveLength(1);
	});
});
