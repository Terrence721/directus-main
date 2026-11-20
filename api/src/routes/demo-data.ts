import type { CurrentUser } from '@directus/stores';

export const DEMO_EMAIL = 'demo@directus-main.dev';
export const DEMO_PASSWORD = 'demo1234';

export interface DemoUser extends CurrentUser {
	password: string;
}

export const USERS: DemoUser[] = [
	{
		email: DEMO_EMAIL,
		password: DEMO_PASSWORD,
		id: 'user-001',
		firstName: 'Demo',
		lastName: 'User',
		avatarUrl: null,
	},
];

export interface DemoItem {
	id: string;
	collection: string;
	title: string;
	status: 'published' | 'draft';
}

export const ITEMS: Record<string, DemoItem[]> = {
	demo_items: [
		{ id: '1', collection: 'demo_items', title: 'First item', status: 'published' },
		{ id: '2', collection: 'demo_items', title: 'Second item', status: 'draft' },
		{ id: '3', collection: 'demo_items', title: 'Third item', status: 'published' },
	],
};

/** Look up a user by their ID (matching the accessToken returned at login). */
export function getCurrentUserById(userId: string): DemoUser | undefined {
	return USERS.find((u) => u.id === userId);
}
