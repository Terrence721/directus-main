import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: 'happy-dom',
		include: ['src/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**/*.ts', 'src/**/*.vue'],
			exclude: ['src/**/*.test.ts', 'src/main.ts'],
		},
	},
});
