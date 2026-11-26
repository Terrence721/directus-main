import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [vue()],
	// Single shared instance of vue/vue-router/pinia, matching the production
	// build (see vite.config.ts). A stray nested node_modules copy of
	// vue-router would otherwise make @directus/composables inject() a router
	// that was never provided, crashing App.vue's setup with
	// "Cannot read properties of undefined (reading 'push')".
	resolve: {
		dedupe: ['vue', 'vue-router', 'pinia'],
	},
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.test.ts'],
		setupFiles: ['./vitest.setup.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts', 'src/**/*.vue'],
			exclude: ['src/**/*.test.ts', 'src/main.ts'],
		},
	},
});
