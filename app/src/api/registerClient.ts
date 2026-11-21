import { InvalidCredentialsError } from '@directus/errors';
import type { CurrentUser, Session } from '@directus/stores';
import { resolveApiBaseUrl } from '@directus/composables';

export interface RegisterData {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

interface RegisterResponse {
	accessToken: string;
	expiresAt: number;
	user: CurrentUser;
}

/**
 * Registers a new account via api/ in dev mode, or simulates registration on GitHub Pages.
 */
export async function register(data: RegisterData): Promise<{ session: Session; user: CurrentUser }> {
	if (import.meta.env.MODE === 'development') {
		return registerReal(data);
	}
	return registerSimulated(data);
}

async function registerReal(data: RegisterData): Promise<{ session: Session; user: CurrentUser }> {
	const response = await fetch(`${resolveApiBaseUrl()}/users`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as { code?: string; message?: string };
		if (body.code === 'NOT_FOUND') {
			throw new Error(body.message ?? 'Email already registered.');
		}
		throw new InvalidCredentialsError();
	}

	const result = (await response.json()) as RegisterResponse;
	return {
		session: { accessToken: result.accessToken, expiresAt: result.expiresAt },
		user: result.user,
	};
}

function registerSimulated(data: RegisterData): Promise<{ session: Session; user: CurrentUser }> {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				session: { accessToken: `demo-${Date.now()}`, expiresAt: Date.now() + 60 * 60 * 1000 },
				user: {
					id: `user-${Date.now()}`,
					email: data.email,
					firstName: data.firstName ?? null,
					lastName: data.lastName ?? null,
					avatarUrl: null,
				},
			});
		}, 400);
	});
}
