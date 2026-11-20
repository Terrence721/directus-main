import type { ModuleConfig } from './defineModule.js';
import type { RouteRecordRaw } from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import { mergeModuleRoutes } from './routing.js';
import RouterPass from './routerPass.js';

vi.mock('./routerPass.js', () => ({ default: { name: 'RouterPass' } }));

describe('mergeModuleRoutes', () => {
	it('returns base routes unchanged when no modules are provided', () => {
		const base: RouteRecordRaw[] = [{ path: '/home', name: 'home', redirect: '/home' }];
		const result = mergeModuleRoutes([], base);

		expect(result).toEqual(base);
	});

	it('preserves module route paths that already start with /', () => {
		const modules: ModuleConfig[] = [
			{
				id: 'settings',
				name: 'Settings',
				icon: 'settings',
				routes: [{ path: '/profile', name: 'profile', component: RouterPass }],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].path).toBe('/profile');
	});

	it('prefixes bare module paths with the module id', () => {
		const modules: ModuleConfig[] = [
			{
				id: 'users',
				name: 'Users',
				icon: 'people',
				routes: [{ path: 'list', name: 'list', component: RouterPass }],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].path).toBe('/users/list');
	});

	it('names routes with the module id prefix', () => {
		const modules: ModuleConfig[] = [
			{ id: 'blog', name: 'Blog', icon: 'edit', routes: [{ path: '/', name: 'index', component: RouterPass }] },
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].name).toBe('blog-index');
	});

	it('skips modules marked as hidden', () => {
		const modules: ModuleConfig[] = [
			{
				id: 'hidden',
				name: 'Hidden',
				icon: 'eye_off',
				hidden: true,
				routes: [{ path: '/', name: 'root', component: RouterPass }],
			},
			{ id: 'visible', name: 'Visible', icon: 'eye', routes: [{ path: '/', name: 'root', component: RouterPass }] },
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('visible-root');
	});

	it('wraps nested children in RouterPass', () => {
		const modules: ModuleConfig[] = [
			{
				id: 'docs',
				name: 'Docs',
				icon: 'article',
				routes: [
					{
						path: '/docs',
						name: 'docs',
						children: [{ path: '', name: 'overview' } as RouteRecordRaw],
					},
				],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].children).toHaveLength(1);
		expect(result[0].children![0].component).toBe(RouterPass);
	});

	it('does not override an existing component on child routes', () => {
		const Leaf = { template: '<p>leaf</p>' };
		const modules: ModuleConfig[] = [
			{
				id: 'settings',
				name: 'Settings',
				icon: 'settings',
				routes: [
					{
						path: '/settings',
						name: 'settings',
						children: [{ path: '', component: Leaf }],
					},
				],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].children![0].component).toBe(Leaf);
	});

	it('prepends base routes before module routes', () => {
		const base: RouteRecordRaw[] = [{ path: '/login', name: 'login', component: RouterPass }];
		const modules: ModuleConfig[] = [
			{
				id: 'reports',
				name: 'Reports',
				icon: 'bar_chart',
				routes: [{ path: '/reports', name: 'reports', component: RouterPass }],
			},
		];
		const result = mergeModuleRoutes(modules, base);

		expect(result[0].name).toBe('login');
		expect(result[1].name).toBe('reports-reports');
	});

	it('recurses into deeply nested children', () => {
		const modules: ModuleConfig[] = [
			{
				id: 'projects',
				name: 'Projects',
				icon: 'folder',
				routes: [
					{
						path: '/projects',
						name: 'projects',
						children: [
							{
								path: '',
								name: 'list',
								children: [{ path: ':id', name: 'detail' } as RouteRecordRaw],
							},
						],
					},
				],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		const inner = result[0].children![0];
		expect(inner.children![0].component).toBe(RouterPass);
	});
});
