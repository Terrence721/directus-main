import js from '@eslint/js';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { flatConfigs as importXFlatConfigs } from 'eslint-plugin-import-x';
import vue from 'eslint-plugin-vue';
import globals from 'globals';
import { config, configs, parser } from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';

export default config(
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '.yarn/**'],
	},
	js.configs.recommended,
	...configs.recommended,
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
			'import-x/typescript': ['.vue'],
		},
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser,
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
