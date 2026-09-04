import js from '@eslint/js';
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
	},
	{
		files: ['**/*.vue'],
		languageOptions: {
			parser: vueParser,
			parserOptions: {
				parser: tseslint.parser,
			},
		},
	},
	prettier,
);
