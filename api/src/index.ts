import cors from 'cors';
import express from 'express';
import { authRouter } from './routes/auth.js';

const PORT = process.env['PORT'] ?? 8055;

export const app = express();

// Wide open: this server only ever runs on a developer's own machine (never deployed), and
// app/'s dev server's port varies (Vite picks the next free one), so there's no fixed origin to
// allowlist and no real security boundary to protect here.
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRouter);

if (process.env['NODE_ENV'] !== 'test') {
	app.listen(PORT, () => {
		console.log(`api listening on port ${PORT}`);
	});
}
