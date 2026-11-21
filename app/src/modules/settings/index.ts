import { defineModule } from '../defineModule.js';
// eslint-disable-next-line import-x/no-unresolved
import SettingsPage from './routes/collection.vue';

export default defineModule({
	id: 'settings',
	name: 'Settings',
	icon: '⚙',
	routes: [{ path: '', name: 'index', component: SettingsPage }],
});
