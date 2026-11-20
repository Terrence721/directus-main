import { InvalidCredentialsError, NotFoundError } from '@directus/errors';
import { Router } from 'express';
import { USERS } from './demo-data.js';
import { isNonEmptyString, slugify } from '@directus/utils';

/** In-memory user registry keyed by email (slugified). */
const usersByEmail = new Map<string, typeof USERS[0]>();
for (const u of USERS) {
	usersByEmail.set(slugify(u.email), u);
}

export const usersRouter = Router();

usersRouter.get('/me', (req, res) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader?.startsWith('Bearer ')) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const userId = authHeader.slice(7);
	const user = USERS.find((u) => u.id === userId);
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

// ---------------------------------------------------------------------------
// Registration endpoint
// ---------------------------------------------------------------------------

interface RegisterBody {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
}

usersRouter.post('/', (req, res) => {
	const body = req.body as unknown as RegisterBody;
	const { email, password, firstName, lastName } = body;

	// --- Validation ----------------------------------------------------------
	if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	if (usersByEmail.has(slugify(email))) {
		const error = new NotFoundError('Email already registered.');
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	// --- Create new demo user ------------------------------------------------
	const id = `user-${Date.now()}`;
	const newUser = {
		id,
		email,
		password,
		firstName: firstName ?? null,
		lastName: lastName ?? null,
		avatarUrl: null,
	};

	usersByEmail.set(slugify(email), newUser);
	USERS.push(newUser as typeof USERS[0]);

	// --- Return session ------------------------------------------------------
	res.status(201).json({
		accessToken: id,
		expiresAt: Date.now() + 60 * 60 * 1000,
		user: {
			id: newUser.id,
			email: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			avatarUrl: newUser.avatarUrl,
		},
	});
});
