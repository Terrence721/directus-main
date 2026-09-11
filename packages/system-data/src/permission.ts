import type { Filter } from './filter.js';

/**
 * Deliberately not reusing @directus/constants's PermissionAction here, even though it's the
 * exact same five-value union: adding that dependency would cost system-data its verified
 * zero-dependency-leaf status. The real source hits this same tension and resolves it the same
 * way — it declares this union locally too, rather than depending on @directus/constants.
 */
export type PermissionsAction = 'create' | 'read' | 'update' | 'delete' | 'share';

export interface Permission {
	id?: number;
	policy: string | null;
	collection: string;
	action: PermissionsAction;
	permissions: Filter | null;
	validation: Filter | null;
	presets: Record<string, unknown> | null;
	fields: string[] | null;
	system?: true;
}

export type DataPermission = Partial<Permission> & Pick<Permission, 'collection' | 'action'>;
