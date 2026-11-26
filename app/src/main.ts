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
		return originalFetch(input, init);
	};
}

app.mount('#app');
