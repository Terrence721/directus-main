import { createRouter, createWebHashHistory } from 'vue-router';
import { vi } from 'vitest';

// Create a test router
const testRouter = createRouter({
	history: createWebHashHistory(),
	routes: [
		{ path: '/', component: { template: '<div>Home</div>' } },
		{ path: '/login', component: { template: '<div>Login</div>' } },
		{ path: '/register', component: { template: '<div>Register</div>' } },
	],
});

// Mock the composables useRouter to return our test router
vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual('@directus/composables');
	return {
		...actual,
		useRouter: () => ({
			router: testRouter,
			route: testRouter.currentRoute,
			push: testRouter.push.bind(testRouter),
			replace: testRouter.replace.bind(testRouter),
			back: testRouter.back.bind(testRouter),
		}),
	};
});

// Global mocks for window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

window.matchMedia = vi.fn().mockImplementation((query: string) => ({
	matches: false,
	media: query,
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn(),
}));
