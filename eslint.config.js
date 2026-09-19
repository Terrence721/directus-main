import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '.yarn/**'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	...vue.configs['flat/recommended'],
	importXFlatConfigs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		settings: {
			'import-x/resolver-next': [createTypeScriptImportResolver()],
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
			},
		},
		rules: {
			// Allow single-word component names ("Collection" instead of "ActivityCollection") — real Directus route/page
			// components are named this way throughout, and they aren't reused elsewhere, so collision risk doesn't apply.
			'vue/multi-word-component-names': 'off',
		},
	},
	prettier,
);
