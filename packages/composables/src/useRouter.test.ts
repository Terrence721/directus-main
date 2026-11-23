import { describe, expect, it, vi } from 'vitest';
import { useRouter } from './useRouter';

const mockRouter = {
	push: vi.fn(),
	replace: vi.fn(),
	back: vi.fn(),
};

vi.mock('vue-router', () => ({
	useRouter: vi.fn(() => mockRouter),
	useRoute: vi.fn(() => ({})),
}));

describe('useRouter', () => {
	it('returns router instance with push/replace/back methods', () => {
		const result = useRouter();

		expect(result).toHaveProperty('router');
		expect(result).toHaveProperty('route');
		expect(typeof result.push).toBe('function');
		expect(typeof result.replace).toBe('function');
		expect(typeof result.back).toBe('function');
	});

	it('push delegates to router.push', async () => {
		const result = useRouter();

		await result.push('/login');

		expect(mockRouter.push).toHaveBeenCalledWith('/login');
	});

	it('replace delegates to router.replace', async () => {
		const result = useRouter();

		await result.replace('/home');

		expect(mockRouter.replace).toHaveBeenCalledWith('/home');
	});

	it('back delegates to router.back', () => {
		const result = useRouter();

		result.back();

		expect(mockRouter.back).toHaveBeenCalledOnce();
	});
});
