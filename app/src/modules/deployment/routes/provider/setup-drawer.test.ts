import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ref } from 'vue';

const routerPushSpy = vi.fn();

vi.mock('@directus/composables', async () => {
	const actual = await vi.importActual<object>('@directus/composables');
	return {
		...actual,
		useDeploymentNavigation: () => ({
			providers: ref([]),
			loading: ref(false),
		}),
	};
});

vi.mock('vue-router', () => ({
	useRoute: () => ({
		params: { provider: 'github' },
	}),
	useRouter: () => ({ push: routerPushSpy }),
}));

beforeEach(() => {
	vi.resetModules();
	vi.clearAllMocks();
	setActivePinia(createPinia());
	routerPushSpy.mockClear();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

async function importProviderSetupDrawer(): Promise<(typeof import('./setup-drawer.vue'))['default']> {
	return (await import('./setup-drawer.vue')).default;
}

describe('ProviderSetupDrawer', () => {
	it('mounts without crashing', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		expect(wrapper.exists()).toBe(true);
	});

	it('renders connect provider header', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		expect(wrapper.find('h1').text()).toBe('Connect Provider');
	});

	it('displays provider dropdown with options', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		const select = wrapper.find('select');
		expect(select.exists()).toBe(true);
		const options = select.findAll('option');
		expect(options).toHaveLength(4);
		expect(options[0].text()).toBe('Select provider');
		expect(options[1].text()).toBe('GitHub');
		expect(options[2].text()).toBe('GitLab');
		expect(options[3].text()).toBe('Bitbucket');
	});

	it('displays repository input field', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		const input = wrapper.find('input[placeholder="owner/repo"]');
		expect(input.exists()).toBe(true);
	});

	it('displays branch input field', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		const input = wrapper.find('input[placeholder="main"]');
		expect(input.exists()).toBe(true);
	});

	it('displays auto-deploy checkbox', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		const checkbox = wrapper.find('input[type="checkbox"]');
		expect(checkbox.exists()).toBe(true);
		// Label contains the text directly - find the fourth label (index 3)
		const labels = wrapper.findAll('label');
		expect(labels[3].text()).toBe('Auto-deploy on push');
	});

	it('displays connect and cancel buttons', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		const buttons = wrapper.findAll('button');
		expect(buttons).toHaveLength(2);
		expect(buttons[0].text()).toBe('Connect');
		expect(buttons[1].text()).toBe('Cancel');
	});

	it('calls onSubmit when form submitted', async () => {
		const ProviderSetupDrawer = await importProviderSetupDrawer();
		const wrapper = mount(ProviderSetupDrawer);
		const form = wrapper.find('form');
		const alertSpy = vi.fn();
		vi.stubGlobal('alert', alertSpy);

		const select = wrapper.find('select');
		await select.setValue('github');

		const repoInput = wrapper.find('input[placeholder="owner/repo"]');
		await repoInput.setValue('owner/repo');

		const branchInput = wrapper.find('input[placeholder="main"]');
		await branchInput.setValue('main');

		const checkbox = wrapper.find('input[type="checkbox"]');
		await checkbox.setValue(true);

		await form.trigger('submit.prevent');

		expect(alertSpy).toHaveBeenCalledWith('Connecting github://owner/repo@main');
	});
});
