import { useAuthStore } from '@directus/stores';
import { createRouter, createWebHashHistory } from 'vue-router';
import HomePage from './views/HomePage.vue';
import LoginPage from './views/LoginPage.vue';

declare module 'vue-router' {
	interface RouteMeta {
		requiresAuth?: boolean;
	}
}

/**
 * Hash history, not createWebHistory: this deploys to a GitHub Pages subpath with no
 * server-side rewrite, so a hard refresh on a real path like /login would 404. Hash routes
 * never leave the client, so they work regardless of deploy depth or server config.
 */
export const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/', name: 'home', component: HomePage, meta: { requiresAuth: true } },
		{ path: '/login', name: 'login', component: LoginPage },
	],
});

router.beforeEach((to) => {
	const auth = useAuthStore();

	if (to.meta.requiresAuth && !auth.loggedIn) {
		return { name: 'login' };
	}

	if (to.name === 'login' && auth.loggedIn) {
		return { name: 'home' };
	}
});
