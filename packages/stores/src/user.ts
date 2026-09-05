import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface CurrentUser {
	id: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	avatarUrl: string | null;
}

function getNameParts(user: CurrentUser): string[] {
	return [user.firstName, user.lastName].filter((part): part is string => Boolean(part));
}

export const useUserStore = defineStore('user', () => {
	const user = ref<CurrentUser | null>(null);

	const fullName = computed(() => {
		if (!user.value) return null;

		const parts = getNameParts(user.value);

		return parts.join(' ') || user.value.email;
	});

	const initials = computed(() => {
		if (!user.value) return null;

		const parts = getNameParts(user.value);

		if (parts.length === 0) {
			return user.value.email.charAt(0).toUpperCase();
		}

		return parts.map((part) => part.charAt(0).toUpperCase()).join('');
	});

	function setUser(newUser: CurrentUser) {
		user.value = newUser;
	}

	function clearUser() {
		user.value = null;
	}

	return { user, fullName, initials, setUser, clearUser };
});
