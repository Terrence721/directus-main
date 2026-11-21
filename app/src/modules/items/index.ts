import { defineModule } from '../defineModule.js';
import ItemBrowser from './routes/collection.vue';

export default defineModule({
	id: 'items',
	name: 'Items',
	icon: '☰',
	routes: [{ path: '', name: 'index', component: ItemBrowser }],
});
