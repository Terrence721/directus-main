import { defineModule } from '../defineModule.js';
import SettingsPage from './routes/collection.vue';

export default defineModule({
	id: 'settings',
	name: 'Settings',
	icon: '⚙',
	routes: [{ path: '', name: 'index', component: SettingsPage }],
});
