import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface Session {
	accessToken: string;
	/** Epoch milliseconds, comparable directly against Date.now(). */
	expiresAt: number;
}

export const useAuthStore = defineStore('auth', () => {
	const session = ref<Session | null>(null);

	const loggedIn = computed(() => session.value !== null && session.value.expiresAt > Date.now());

	function setSession(accessToken: string, expiresAt: number) {
		session.value = { accessToken, expiresAt };
	}

	function clearSession() {
		session.value = null;
	}

	return { session, loggedIn, setSession, clearSession };
});
