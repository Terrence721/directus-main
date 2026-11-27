import { InvalidCredentialsError } from '@directus/errors';
import type { CurrentUser, Session } from '@directus/stores';

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

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8055';

/**
 * Registers a new account via api/ in dev mode, or simulates registration on GitHub Pages. When
 * VITE_API_BASE_URL is configured, the real registration endpoint is used against that backend.
 */
export async function register(data: RegisterData): Promise<{ session: Session; user: CurrentUser }> {
	if (import.meta.env.MODE === 'development' || import.meta.env.VITE_API_BASE_URL) {
		return registerReal(data);
	}
	return registerSimulated(data);
}

async function registerReal(data: RegisterData): Promise<{ session: Session; user: CurrentUser }> {
	const response = await fetch(`${API_URL}/users`, {
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
