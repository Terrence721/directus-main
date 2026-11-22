import { defineModule } from '../defineModule.js';

import CollectionBrowser from './routes/collection.vue';
import ItemDetail from './routes/detail.vue';

export default defineModule({
	id: 'visual',
	name: 'Visual',
	icon: 'visual',
	routes: [
		{ path: '', name: 'index', component: CollectionBrowser },
		{ path: ':collection/:id', name: 'item', component: ItemDetail },
	],
});
