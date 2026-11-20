import { Router } from 'express';
import { isNonEmptyString } from '@directus/utils';
import { InvalidCredentialsError } from '@directus/errors';
import type { AuthProvider, ServerInfo } from '@directus/stores';

const DEMO_EMAIL = 'demo@directus-main.dev';
const DEMO_PASSWORD = 'demo1234';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
	const { email, password } = req.body as { email?: string; password?: string };

	if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	res.json({ accessToken: `demo-${Date.now()}`, expiresAt: Date.now() + 60 * 60 * 1000 });
});

export function buildServerInfo(): ServerInfo {
	return {
		projectName: 'Directus Main Demo',
		projectLogoUrl: null,
		projectColor: '#563acc',
		authProviders: [
			{ name: 'Email / Password', driver: 'local' },
			{ name: 'Google', driver: 'oauth2' },
			{ name: 'GitHub', driver: 'oauth2' },
		] as AuthProvider[],
		registrationEnabled: true,
	};
}

export const serverRouter = Router();

serverRouter.get('/info', (_req, res) => {
	const info = buildServerInfo();
	res.json(info);
});
