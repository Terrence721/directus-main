import type { RouteRecordRaw } from 'vue-router';
import type { ModuleConfig } from './defineModule.js';
import RouterPass from './routerPass.js';

/**
 * Given a collection of {@link ModuleConfig} modules, flatten their
 * top-level route definitions (with the module id as prefix) and recurse
 * into nested children, wrapping each level in {@link RouterPass} so Vue
 * Router treats every sub-tree as a proper nested `<RouterView>`.
 *
 * Returns route objects that can be spliced directly into a
 * `createRouter({ routes: [...] })` config.
 */
export function mergeModuleRoutes(
	modules: ModuleConfig[],
	/** Base routes to prepend before any module routes (e.g. home/login). */
	baseRoutes: RouteRecordRaw[],
): RouteRecordRaw[] {
	const result: RouteRecordRaw[] = [...baseRoutes];

	for (const module of modules) {
		if (module.hidden) continue;

		for (const route of module.routes) {
			result.push(mergeRoute(module.id, route));
		}
	}

	return result;
}

/** Add the module id prefix to a single route, recursing into children. */
function mergeRoute(moduleId: string, route: RouteRecordRaw): RouteRecordRaw {
	const nameSuffix = String(route.name ?? '');
	const name = nameSuffix ? `${moduleId}-${nameSuffix}` : moduleId;

	return {
		path: route.path?.startsWith('/') ? route.path : `/${moduleId}/${route.path ?? ''}`,
		name,
		component: route.component ?? RouterPass,
		redirect: route.redirect,
		props: route.props,
		meta: route.meta,
		children: wrapChildren(route.children),
	} as RouteRecordRaw;
}

/**
 * Recursively ensure every child in a tree has a component so Vue Router
 * always has a `<RouterView>` to render through.
 */
function wrapChildren(children?: RouteRecordRaw[]): RouteRecordRaw[] | undefined {
	if (!children || children.length === 0) return undefined;

	return children.map((child) => ({
		path: child.path,
		name: child.name,
		component: child.component ?? RouterPass,
		redirect: child.redirect,
		props: child.props,
		meta: child.meta,
		children: wrapChildren(child.children),
	})) as RouteRecordRaw[];
}
