import { ref } from 'vue';

export function useNavigation() {
	const activeCollection = ref<string | null>(null);
	const collapsedGroups = ref<Set<string>>(new Set());

	function toggleGroup(group: string) {
		collapsedGroups.value = new Set(collapsedGroups.value);
		if (collapsedGroups.value.has(group)) {
			collapsedGroups.value.delete(group);
		} else {
			collapsedGroups.value.add(group);
		}
	}

	return {
		activeCollection,
		collapsedGroups,
		toggleGroup,
	};
}
