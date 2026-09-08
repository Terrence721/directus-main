import express from 'express';

const PORT = process.env['PORT'] ?? 8055;

export const app = express();

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

if (process.env['NODE_ENV'] !== 'test') {
	app.listen(PORT, () => {
		console.log(`api listening on port ${PORT}`);
	});
}
