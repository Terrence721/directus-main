import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import RouterPass from './routerPass.js';

describe('RouterPass', () => {
	it('renders whatever the current child route renders', async () => {
		const router = createRouter({
			history: createWebHistory(),
			routes: [
				{
					path: '/',
					component: RouterPass,
					children: [{ path: '', component: { template: '<p>child content</p>' } }],
				},
			],
		});

		await router.push('/');
		await router.isReady();

		const wrapper = mount(RouterPass, { global: { plugins: [router] } });

		expect(wrapper.text()).toBe('child content');
	});
});
