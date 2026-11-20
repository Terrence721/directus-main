import { describe, expect, it, vi } from 'vitest';
import { mergeModuleRoutes } from './routing.js';
import RouterPass from './routerPass.js';

vi.mock('./routerPass.js', () => ({ default: { name: 'RouterPass' } }));

describe('mergeModuleRoutes', () => {
	it('returns base routes unchanged when no modules are provided', () => {
		const base = [{ path: '/home', name: 'home' }];
		const result = mergeModuleRoutes([], base);

		expect(result).toEqual(base);
	});

	it('preserves module route paths that already start with /', () => {
		const modules = [
			{
				id: 'settings',
				routes: [{ path: '/profile', name: 'profile' }],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].path).toBe('/profile');
	});

	it('prefixes bare module paths with the module id', () => {
		const modules = [
			{
				id: 'users',
				routes: [{ path: 'list', name: 'list' }],
			},
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].path).toBe('/users/list');
	});

	it('names routes with the module id prefix', () => {
		const modules = [
			{ id: 'blog', routes: [{ path: '/', name: 'index' }] },
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result[0].name).toBe('blog-index');
	});

	it('skips modules marked as hidden', () => {
		const modules = [
			{ id: 'hidden', hidden: true, routes: [{ path: '/', name: 'root' }] },
			{ id: 'visible', routes: [{ path: '/', name: 'root' }] },
		];
		const result = mergeModuleRoutes(modules, []);

		expect(result).toHaveLength(1);
		expect(result[0].name).toBe('visible-root');
	});

	it('wraps nested children in RouterPass', () => {
		const modules = [
			{
				id: 'docs',
				routes: [
					{
						path: '/docs',
						name: 'docs',
						children: [{ path: '', name: 'overview' }],
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
		const modules = [
			{
				id: 'settings',
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
		const base = [{ path: '/login', name: 'login' }];
		const modules = [
			{ id: 'reports', routes: [{ path: '/reports', name: 'reports' }] },
		];
		const result = mergeModuleRoutes(modules, base);

		expect(result[0].name).toBe('login');
		expect(result[1].name).toBe('reports-reports');
	});

	it('recurses into deeply nested children', () => {
		const modules = [
			{
				id: 'projects',
				routes: [
					{
						path: '/projects',
						name: 'projects',
						children: [
							{
								path: '',
								name: 'list',
								children: [{ path: ':id', name: 'detail' }],
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
