import { InvalidCredentialsError } from '@directus/errors';
import type { Session } from '@directus/stores';

const DEMO_EMAIL = 'demo@directus-main.dev';
const DEMO_PASSWORD = 'demo1234';

/**
 * Stand-in for a real HTTP client until `api/` and `packages/sdk` exist. Simulates network
 * latency and accepts only one known demo account, so a real visitor to the deployed app can
 * exercise both LoginForm's success and error paths, not just its unit tests.
 */
export async function login(credentials: { email: string; password: string }): Promise<Session> {
	await new Promise((resolve) => setTimeout(resolve, 400));

	if (credentials.email !== DEMO_EMAIL || credentials.password !== DEMO_PASSWORD) {
		throw new InvalidCredentialsError();
	}

	return { accessToken: `demo-${Date.now()}`, expiresAt: Date.now() + 60 * 60 * 1000 };
}
