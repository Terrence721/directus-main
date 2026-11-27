import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');

	return {
		plugins: [vue()],
		// Relative base so the build works when served from a subpath (e.g. GitHub Pages'
		// terrence721.github.io/directus-main/app/) without hardcoding that path here.
		base: './',
		resolve: {
			// The @directus/* workspace packages are consumed from their built dist/.
			// If a stray nested node_modules copy of vue or vue-router ever exists
			// (e.g. packages/composables/node_modules/vue-router), Node resolution would
			// give them a *second* instance: inject()/useRouter() would look up a key
			// the app never provided, return undefined, and crash with
			// "Cannot read properties of undefined (reading 'push')".
			// dedupe forces every import of these packages to the root node_modules copy,
			// so there is exactly one vue/vue-router/pinia instance in the bundle.
			dedupe: ['vue', 'vue-router', 'pinia'],
		},
		define: {
			// Expose the API base URL at runtime. When set (e.g. VITE_API_BASE_URL=
			// https://api.example.com), the app will use it instead of the localhost
			// fallback or simulated mode. When empty, existing behavior is preserved.
			'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL ?? ''),
		},
	};
});
