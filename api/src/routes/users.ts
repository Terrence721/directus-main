import { InvalidCredentialsError, NotFoundError } from '@directus/errors';
import { Router } from 'express';
import { USERS } from './demo-data.js';
import { slugify } from '@directus/utils';
import { validateRegister, validatePatchUser } from '@directus/validation';

/** In-memory user registry keyed by email (slugified). */
const usersByEmail = new Map<string, (typeof USERS)[0]>();
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
// GET /users - List all users (with pagination)
// ---------------------------------------------------------------------------

usersRouter.get('/', (req, res) => {
	const queryLimit = parseInt(req.query.limit as string, 10);
	const limit = Number.isFinite(queryLimit) && queryLimit > 0 ? queryLimit : 20;
	const queryPage = parseInt(req.query.page as string, 10);
	const page = Number.isFinite(queryPage) && queryPage > 0 ? queryPage : 1;
	const start = (page - 1) * limit;
	const end = start + limit;

	const pageUsers = USERS.slice(start, end).map((u) => ({
		id: u.id,
		email: u.email,
		firstName: u.firstName,
		lastName: u.lastName,
		avatarUrl: u.avatarUrl,
	}));

	res.json({
		data: pageUsers,
		meta: {
			totalCount: USERS.length,
			page,
			pageSize: limit,
			lastPage: Math.ceil(USERS.length / limit),
		},
	});
});

// ---------------------------------------------------------------------------
// GET /users/:id - Get specific user
// ---------------------------------------------------------------------------

usersRouter.get('/:id', (req, res) => {
	const userId = req.params.id;
	const user = USERS.find((u) => u.id === userId);

	if (!user) {
		const error = new NotFoundError(`User "${userId}" not found.`);
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	res.json({
		data: {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			avatarUrl: user.avatarUrl,
		},
	});
});

// ---------------------------------------------------------------------------
// DELETE /users/me - Delete current user account
// ---------------------------------------------------------------------------

usersRouter.delete('/me', (req, res) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader?.startsWith('Bearer ')) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const userId = authHeader.slice(7);
	const userIndex = USERS.findIndex((u) => u.id === userId);
	if (userIndex === -1) {
		const error = new NotFoundError(`User "${userId}" not found.`);
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const [userToRemove] = USERS.splice(userIndex, 1);
	if (userToRemove) {
		usersByEmail.delete(slugify(userToRemove.email));
	}

	res.json({
		data: { deleted: true },
		message: 'User account deleted successfully',
	});
});

// ---------------------------------------------------------------------------
// PATCH /users/me - Update current user profile
// ---------------------------------------------------------------------------

interface PatchUserBody {
	firstName?: string | null;
	lastName?: string | null;
	email?: string;
	password?: string;
}

usersRouter.patch('/me', (req, res) => {
	const authHeader = req.headers['authorization'];
	if (!authHeader?.startsWith('Bearer ')) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const userId = authHeader.slice(7);
	const userIndex = USERS.findIndex((u) => u.id === userId);
	if (userIndex === -1) {
		const error = new InvalidCredentialsError();
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	const body = req.body as unknown as PatchUserBody;
	const { firstName, lastName, email, password } = body;

	// --- Validation ----------------------------------------------------------
	const validationErrors = validatePatchUser({ firstName, lastName, email, password });
	if (validationErrors.length > 0) {
		const error = new InvalidCredentialsError({ cause: new Error(validationErrors[0].message) });
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	// Check email uniqueness if email is being changed
	if (email !== undefined && email !== USERS[userIndex].email) {
		const slugified = slugify(email);
		if (slugified && usersByEmail.has(slugified)) {
			const error = new NotFoundError('Email already registered.');
			res.status(error.status).json({ code: error.code, message: error.message });
			return;
		}
	}

	// --- Update user ---------------------------------------------------------
	const user = USERS[userIndex];

	// Update email if provided and different
	if (email !== undefined && email !== user.email) {
		usersByEmail.delete(slugify(user.email));
		user.email = email;
		usersByEmail.set(slugify(email), user);
	}

	if (firstName !== undefined) user.firstName = firstName;
	if (lastName !== undefined) user.lastName = lastName;
	if (password !== undefined) user.password = password;

	// --- Return updated user -------------------------------------------------
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
	const validationErrors = validateRegister({ email, password, firstName, lastName });
	if (validationErrors.length > 0) {
		// Return the first validation error as 401 to match existing behavior
		const error = new InvalidCredentialsError({ cause: new Error(validationErrors[0].message) });
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	// After validation passes, email and password are guaranteed non-empty strings.
	const validatedEmail = email as string;
	const validatedPassword = password as string;

	if (usersByEmail.has(slugify(validatedEmail))) {
		const error = new NotFoundError('Email already registered.');
		res.status(error.status).json({ code: error.code, message: error.message });
		return;
	}

	// --- Create new demo user ------------------------------------------------
	const id = `user-${Date.now()}`;
	const newUser = {
		id,
		email: validatedEmail,
		password: validatedPassword,
		firstName: firstName ?? null,
		lastName: lastName ?? null,
		avatarUrl: null,
	};

	usersByEmail.set(slugify(validatedEmail), newUser);
	USERS.push(newUser as (typeof USERS)[0]);

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
