import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router.js';
import { handleSimulatedRequest } from '@directus/composables';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

if (import.meta.env.MODE !== 'development') {
	// On GitHub Pages there's no api/ server, so route localhost:8055 calls
	// through an in-memory stand-in that mirrors api/src/routes/* so the demo
	// app keeps working after login.
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const urlStr = input instanceof Request ? input.url : String(input);
		if (urlStr.includes('localhost:8055')) {
			const path = urlStr.replace('http://localhost:8055', '');
			const simulated = handleSimulatedRequest(path, init);
			return new Response(JSON.stringify(await simulated.json()), {
				status: simulated.status,
				statusText: simulated.ok ? 'OK' : 'Error',
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// For any other URL (including production API endpoints), use real fetch
		return originalFetch(input, init);
	};
} else if (import.meta.env.VITE_API_BASE_URL) {
	// In non-development environments with VITE_API_BASE_URL configured,
	// use real fetch against the specified base URL (for production deployments
	// where api/ is hosted publicly).
	// ⚠️ NOTE: The api/ server is intentionally demo-only (mirrors
	// api/src/routes/* from api/src/routes/demo-data.ts). Pointing
	// VITE_API_BASE_URL at a non-Directus backend will cause route
	// mismatches — use only with a Directus-compatible production API.
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		// If the URL already includes the base, pass through to real fetch
		return originalFetch(input, init);
	};
} else {
	// Development mode with simulated API (default behavior)
	const originalFetch = window.fetch.bind(window);
	window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		const urlStr = input instanceof Request ? input.url : String(input);
		if (urlStr.includes('localhost:8055')) {
			const path = urlStr.replace('http://localhost:8055', '');
			const simulated = handleSimulatedRequest(path, init);
			return new Response(JSON.stringify(await simulated.json()), {
				status: simulated.status,
				statusText: simulated.ok ? 'OK' : 'Error',
				headers: { 'Content-Type': 'application/json' },
			});
		}
		return originalFetch(input, init);
	};
}

app.mount('#app');
