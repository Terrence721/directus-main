import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [vue()],
	// Relative base so the build works when served from a subpath (e.g. GitHub Pages'
	// terrence721.github.io/directus-main/app/) without hardcoding that path here.
	base: './',
});
