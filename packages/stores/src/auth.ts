import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
	const accessToken = ref<string | null>(null);
	const expiresAt = ref<number | null>(null);

	const loggedIn = computed(() => accessToken.value !== null);

	function setSession(token: string, expires: number) {
		accessToken.value = token;
		expiresAt.value = expires;
	}

	function clearSession() {
		accessToken.value = null;
		expiresAt.value = null;
	}

	return { accessToken, expiresAt, loggedIn, setSession, clearSession };
});
