import { defineModule } from '../defineModule.js';
import CollectionBrowser from './routes/collection.vue';
import ItemDetail from './routes/detail.vue';

export default defineModule({
	id: 'content',
	name: 'Content',
	icon: 'box',
	routes: [
		{ path: '', name: 'index', component: CollectionBrowser },
		{ path: ':collection/:id', name: 'item', component: ItemDetail },
	],
});
