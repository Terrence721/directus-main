#!/usr/bin/env node
// Builds a standalone, production-only copy of the `directus` workspace into ./dist,
// mirroring what `pnpm --filter directus deploy --legacy --prod dist` used to produce.
//
// Non-destructive: `yarn workspaces focus` prunes node_modules down to just what
// `directus` needs for production, which would otherwise mutate the repo's own
// install in place. Runs it inside a disposable `git worktree` checked out from
// HEAD instead, so the live working tree's node_modules is never touched. Builds
// from the last commit, not uncommitted changes - as expected for a production
// deploy.

import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'dist');
const worktree = join(tmpdir(), `directus-deploy-${Date.now()}`);

function run(command, args, cwd = root) {
	const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: true });

	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

rmSync(dist, { recursive: true, force: true });

run('git', ['worktree', 'add', '--detach', worktree, 'HEAD']);

try {
	run('yarn', ['workspaces', 'focus', 'directus', '--production'], worktree);

	cpSync(join(worktree, 'directus'), dist, {
		recursive: true,
		filter: (src) => !src.includes(`${join('directus', 'node_modules')}`),
	});

	cpSync(join(worktree, 'node_modules'), join(dist, 'node_modules'), { recursive: true });
} finally {
	run('git', ['worktree', 'remove', '--force', worktree]);
}

const { name, version, type, exports: pkgExports, bin } = JSON.parse(readFileSync(join(dist, 'package.json'), 'utf8'));
const { packageManager } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

writeFileSync(join(dist, 'package.json'), JSON.stringify({ name, version, type, exports: pkgExports, bin, packageManager }, null, 2));

for (const dir of ['database', 'extensions', 'uploads', '.pm2']) {
	mkdirSync(join(dist, dir), { recursive: true });
}
