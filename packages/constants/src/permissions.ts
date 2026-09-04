export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete', 'share'] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];
