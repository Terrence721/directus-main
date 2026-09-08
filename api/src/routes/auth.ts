import { InvalidCredentialsError } from '@directus/errors';
import { Router } from 'express';

const DEMO_EMAIL = 'demo@directus-main.dev';
const DEMO_PASSWORD = 'demo1234';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
	const { email, password } = req.body as { email?: string; password?: string };

	if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	res.json({ accessToken: `demo-${Date.now()}`, expiresAt: Date.now() + 60 * 60 * 1000 });
});
