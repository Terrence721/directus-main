import { InvalidCredentialsError } from '@directus/errors';
import type { Session } from '@directus/stores';

const DEMO_EMAIL = 'demo@directus-main.dev';
const DEMO_PASSWORD = 'demo1234';
const API_URL = 'http://localhost:8055';

/**
 * Calls the real api/ server in local dev only (checked via MODE, not DEV - Vitest's test runs
 * also report DEV: true, which would otherwise send every test down this path). api/ isn't
 * deployed anywhere public yet, so the deployed GitHub Pages app keeps using loginSimulated.
 */
export async function login(credentials: { email: string; password: string }): Promise<Session> {
	return import.meta.env.MODE === 'development' ? loginReal(credentials) : loginSimulated(credentials);
}

async function loginReal(credentials: { email: string; password: string }): Promise<Session> {
	const response = await fetch(`${API_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new InvalidCredentialsError();
	}

	return response.json();
}

/**
 * Stand-in for a real HTTP client, used wherever api/ isn't reachable - the deployed GitHub Pages
 * app has no backend to call. Simulates network latency and accepts only one known demo account,
 * so a real visitor to the deployed app can exercise both LoginForm's success and error paths,
 * not just its unit tests.
 */
async function loginSimulated(credentials: { email: string; password: string }): Promise<Session> {
	await new Promise((resolve) => setTimeout(resolve, 400));

	if (credentials.email !== DEMO_EMAIL || credentials.password !== DEMO_PASSWORD) {
		throw new InvalidCredentialsError();
	}

	return { accessToken: `demo-${Date.now()}`, expiresAt: Date.now() + 60 * 60 * 1000 };
}
