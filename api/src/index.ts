import express from 'express';
import { authRouter } from './routes/auth.js';

const PORT = process.env['PORT'] ?? 8055;

export const app = express();

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
