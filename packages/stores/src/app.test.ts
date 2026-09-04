import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './app.js';

beforeEach(() => {
	setActivePinia(createPinia());
});

describe('useAppStore', () => {
	it('starts idle: not hydrated, not hydrating, no error', () => {
		const app = useAppStore();

		expect(app.hydrated).toBe(false);
		expect(app.hydrating).toBe(false);
		expect(app.hydrationError).toBeNull();
	});

	it('reports hydrating once started', () => {
		const app = useAppStore();

		app.startHydration();

		expect(app.hydrating).toBe(true);
		expect(app.hydrated).toBe(false);
		expect(app.hydrationError).toBeNull();
	});

	it('reports hydrated once completed', () => {
		const app = useAppStore();

		app.startHydration();
		app.completeHydration();

		expect(app.hydrated).toBe(true);
		expect(app.hydrating).toBe(false);
		expect(app.hydrationError).toBeNull();
	});

	it('reports the error and clears hydrated/hydrating on failure', () => {
		const app = useAppStore();
		const error = new Error('network down');

		app.startHydration();
		app.failHydration(error);

		expect(app.hydrationError).toBe(error);
		expect(app.hydrated).toBe(false);
		expect(app.hydrating).toBe(false);
	});

	it('toggles the notifications drawer', () => {
		const app = useAppStore();

		expect(app.notificationsDrawerOpen).toBe(false);

		app.toggleNotificationsDrawer();
		expect(app.notificationsDrawerOpen).toBe(true);

		app.toggleNotificationsDrawer();
		expect(app.notificationsDrawerOpen).toBe(false);
	});

	it('sets the notifications drawer to an explicit value', () => {
		const app = useAppStore();

		app.toggleNotificationsDrawer(true);
		expect(app.notificationsDrawerOpen).toBe(true);

		app.toggleNotificationsDrawer(true);
		expect(app.notificationsDrawerOpen).toBe(true);

		app.toggleNotificationsDrawer(false);
		expect(app.notificationsDrawerOpen).toBe(false);
	});
});
