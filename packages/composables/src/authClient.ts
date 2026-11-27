import { InvalidCredentialsError } from '@directus/errors';
import type { Session } from '@directus/stores';

/** Login credentials for the auth client */
export interface LoginCredentials {
	email: string;
	password: string;
}

const DEMO_EMAIL = 'demo@directus-main.dev';
const DEMO_PASSWORD = 'demo1234';

/** Derives the API base URL from the env var or local dev default. */
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8055';

/** Storage keys for persisting session across hard refreshes */
const ACCESS_TOKEN_KEY = 'directus_access_token';
const EXPIRES_AT_KEY = 'directus_expires_at';

/**
 * Retrieves a stored session from localStorage, if any.
 * On hard refresh, the app can restore the session without re-prompting for credentials.
 */
export function getStoredSession(): Session | null {
	if (typeof window === 'undefined') return null;
	const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
	const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
	if (!accessToken || !expiresAt) return null;
	return { accessToken, expiresAt: Number(expiresAt) };
}

/**
 * Stores session tokens in localStorage so they survive hard refreshes.
 */
export function storeSession(session: Session) {
	if (typeof window === 'undefined') return;
	localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
	localStorage.setItem(EXPIRES_AT_KEY, session.expiresAt.toString());
}

/**
 * Removes stored session tokens (e.g. on logout).
 */
export function clearStoredSession() {
	if (typeof window === 'undefined') return;
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(EXPIRES_AT_KEY);
}

/**
 * Refreshes an access token by re-logging in. Returns a new session, or null if the refresh failed.
 * This is used when an access token is expired or about to expire.
 */
export async function refreshSession(): Promise<Session | null> {
	// Try to get a valid session from storage first
	const stored = getStoredSession();
	if (stored && Date.now() < stored.expiresAt - 5 * 60 * 1000) {
		// Session is still valid (with 5 minute buffer)
		return stored;
	}

	// Need to re-authenticate
	return login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
}

/**
 * Calls the real api/ server in local dev only (checked via MODE, not DEV - Vitest's test runs
 * also report DEV: true, which would otherwise send every test down this path). api/ isn't
 * deployed anywhere public yet, so the deployed GitHub Pages app keeps using loginSimulated.
 */
export async function login(credentials: LoginCredentials): Promise<Session> {
	if (import.meta.env.MODE === 'development') {
		return loginReal(credentials);
	}
	if (import.meta.env.VITE_API_BASE_URL) {
		return loginReal(credentials);
	}
	return loginSimulated(credentials);
}

async function loginReal(credentials: LoginCredentials): Promise<Session> {
	const response = await fetch(`${API_URL}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new InvalidCredentialsError();
	}

	const result = (await response.json()) as Session;
	storeSession(result);
	return result;
}

/**
 * Stand-in for a real HTTP client, used wherever api/ isn't reachable - the deployed GitHub Pages
 * app has no backend to call. Simulates network latency and accepts only one known demo account,
 * so a real visitor to the deployed app can exercise both LoginForm's success and error paths,
 * not just its unit tests.
 */
async function loginSimulated(credentials: LoginCredentials): Promise<Session> {
	await new Promise((resolve) => setTimeout(resolve, 400));

	if (credentials.email !== DEMO_EMAIL || credentials.password !== DEMO_PASSWORD) {
		throw new InvalidCredentialsError();
	}

	const session: Session = {
		accessToken: `demo-${Date.now()}`,
		expiresAt: Date.now() + 60 * 60 * 1000,
	};
	storeSession(session);
	return session;
}
