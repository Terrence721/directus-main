import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.js';
import { itemsRouter } from './routes/items.js';
import { serverRouter } from './routes/server.js';
import { usersRouter } from './routes/users.js';
import { filesRouter } from './routes/files.js';
import { collectionsRouter } from './routes/collections.js';
import { searchRouter } from './routes/search.js';
import { activityRouter } from './routes/activity.js';
import { requestLogger, rateLimit } from './middleware.js';

const PORT = process.env['PORT'] ?? 8055;

export const app = express();

// Wide open: this server only ever runs on a developer's own machine (never deployed), and
// app/'s dev server's port varies (Vite picks the next free one), so there's no fixed origin to
// allowlist and no real security boundary to protect here.
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Rate limit all endpoints to 100 requests per minute per IP
app.use(rateLimit(100, 60_000));

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/items', itemsRouter);
app.use('/server', serverRouter);
app.use('/users', usersRouter);
app.use('/files', filesRouter);
app.use('/collections', collectionsRouter);
app.use('/search', searchRouter);
app.use('/activity', activityRouter);

if (process.env['NODE_ENV'] !== 'test') {
	app.listen(PORT, () => {
		console.log(`api listening on port ${PORT}`);
	});
}
