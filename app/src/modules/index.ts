import type { ModuleConfig } from './defineModule.js';

export function getInternalModules(): ModuleConfig[] {
	const modules = import.meta.glob<ModuleConfig>('./*/index.ts', { import: 'default', eager: true });

	return Object.values(modules).sort((a, b) => a.id.localeCompare(b.id));
}
