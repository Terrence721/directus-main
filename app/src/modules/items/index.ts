import { defineModule } from '../defineModule.js';
import ItemBrowser from './routes/collection.vue';
import ItemDetail from './routes/detail.vue';

export default defineModule({
	id: 'items',
	name: 'Items',
	icon: '☰',
	routes: [
		{ path: '', name: 'index', component: ItemBrowser },
		{ path: ':id', name: 'detail', component: ItemDetail },
	],
});
