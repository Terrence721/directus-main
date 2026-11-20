import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../index.js';
import { buildServerInfo } from './server.js';

describe('GET /server/info', () => {
	it('returns a full ServerInfo payload', async () => {
		const response = await request(app).get('/server/info');

		expect(response.status).toBe(200);
		const expected = buildServerInfo();
		expect(response.body).toEqual({
			projectName: expected.projectName,
			projectLogoUrl: expected.projectLogoUrl,
			projectColor: expected.projectColor,
			authProviders: expect.arrayContaining([
				expect.objectContaining({ name: 'Email / Password', driver: 'local' }),
				expect.objectContaining({ name: 'Google', driver: 'oauth2' }),
				expect.objectContaining({ name: 'GitHub', driver: 'oauth2' }),
			]),
			registrationEnabled: true,
		});
	});

	it('returns a stable, deterministic payload', async () => {
		const a = await request(app)
			.get('/server/info')
			.then((r) => r.body);
		const b = await request(app)
			.get('/server/info')
			.then((r) => r.body);

		expect(a).toEqual(b);
	});
});
