import { InvalidCredentialsError } from '@directus/errors';
import { Router } from 'express';
import { USERS } from './demo-data.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
	const { email, password } = req.body as { email?: string; password?: string };

	if (!email || !password) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const user = USERS.find((u) => u.email === email && u.password === password);
	if (!user) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	res.json({ accessToken: user.id, expiresAt: Date.now() + 60 * 60 * 1000 });
});
