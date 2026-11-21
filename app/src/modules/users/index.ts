import { defineModule } from '../defineModule.js';
import UserManagement from './routes/collection.vue';

export default defineModule({
	id: 'users',
	name: 'Users',
	icon: '👤',
	routes: [{ path: '', name: 'index', component: UserManagement }],
});
