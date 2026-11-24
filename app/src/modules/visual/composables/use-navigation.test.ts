import { describe, expect, it } from 'vitest';
import { useNavigation } from './use-navigation';

describe('useNavigation', () => {
	it('returns refs with default values', () => {
		const { activeCollection, collapsedGroups } = useNavigation();

		expect(activeCollection.value).toBeNull();
		expect(collapsedGroups.value).toEqual(new Set());
	});

	it('toggles a group on', () => {
		const { collapsedGroups, toggleGroup } = useNavigation();

		toggleGroup('posts');

		expect(collapsedGroups.value.has('posts')).toBe(true);
	});

	it('toggles a group off', () => {
		const { collapsedGroups, toggleGroup } = useNavigation();

		// Start with group already on
		collapsedGroups.value.add('posts');
		expect(collapsedGroups.value.has('posts')).toBe(true);

		// Toggle off
		toggleGroup('posts');
		expect(collapsedGroups.value.has('posts')).toBe(false);
	});

	it('does not affect other groups', () => {
		const { collapsedGroups, toggleGroup } = useNavigation();

		collapsedGroups.value.add('posts');
		collapsedGroups.value.add('pages');

		toggleGroup('posts');

		expect(collapsedGroups.value.has('posts')).toBe(false);
		expect(collapsedGroups.value.has('pages')).toBe(true);
	});

	it('toggles the same group multiple times', () => {
		const { collapsedGroups, toggleGroup } = useNavigation();

		// on -> off -> on -> off
		toggleGroup('posts');
		expect(collapsedGroups.value.has('posts')).toBe(true);

		toggleGroup('posts');
		expect(collapsedGroups.value.has('posts')).toBe(false);

		toggleGroup('posts');
		expect(collapsedGroups.value.has('posts')).toBe(true);

		toggleGroup('posts');
		expect(collapsedGroups.value.has('posts')).toBe(false);
	});

	it('activeCollection is a ref', () => {
		const { activeCollection } = useNavigation();

		expect(activeCollection.value).toBeNull();
		activeCollection.value = 'posts';
		expect(activeCollection.value).toBe('posts');
	});
});
