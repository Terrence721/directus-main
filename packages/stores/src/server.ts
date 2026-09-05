import { LOCAL_AUTH_DRIVER } from '@directus/constants';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export interface AuthProvider {
	name: string;
	driver: string;
}

export interface ServerInfo {
	projectName: string;
	projectLogoUrl: string | null;
	projectColor: string | null;
	authProviders: AuthProvider[];
	registrationEnabled: boolean;
}

export const useServerStore = defineStore('server', () => {
	const info = ref<ServerInfo | null>(null);

	const hasCustomBranding = computed(() => info.value?.projectLogoUrl != null || info.value?.projectColor != null);

	const ssoProviders = computed(
		() => info.value?.authProviders.filter((provider) => provider.driver !== LOCAL_AUTH_DRIVER) ?? [],
	);

	function setInfo(newInfo: ServerInfo) {
		info.value = newInfo;
	}

	function clearInfo() {
		info.value = null;
	}

	return { info, hasCustomBranding, ssoProviders, setInfo, clearInfo };
});
