#!/usr/bin/env node
// Builds a standalone, production-only copy of the `directus` workspace into ./dist,
// mirroring what `pnpm --filter directus deploy --legacy --prod dist` used to produce.
//
// WARNING: this destructively prunes the repo's own root node_modules down to only
// what `directus` needs for production (via `yarn workspaces focus`). Only run this
// in a disposable checkout (e.g. a Docker build stage) — on a persistent dev checkout,
// run `yarn install` afterward to restore the full node_modules tree.

import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');

function run(command, args) {
	const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: true });

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

rmSync(dist, { recursive: true, force: true });

run('yarn', ['workspaces', 'focus', 'directus', '--production']);

cpSync(join(root, 'directus'), dist, { recursive: true, filter: (src) => !src.includes(`${join('directus', 'node_modules')}`) });
cpSync(join(root, 'node_modules'), join(dist, 'node_modules'), { recursive: true });

const { name, version, type, exports: pkgExports, bin } = JSON.parse(readFileSync(join(dist, 'package.json'), 'utf8'));
const { packageManager } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

writeFileSync(join(dist, 'package.json'), JSON.stringify({ name, version, type, exports: pkgExports, bin, packageManager }, null, 2));

for (const dir of ['database', 'extensions', 'uploads', '.pm2']) {
	mkdirSync(join(dist, dir), { recursive: true });
}
