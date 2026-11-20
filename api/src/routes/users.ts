import { InvalidCredentialsError } from '@directus/errors';
import { Router } from 'express';
import { getCurrentUserById } from './demo-data.js';

export const usersRouter = Router();

usersRouter.get('/me', (req, res) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader?.startsWith('Bearer ')) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const userId = authHeader.slice(7);
	const user = getCurrentUserById(userId);
	if (!user) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	res.json({
		user: {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
		},
	});
});
