import { defineModule } from '../defineModule.js';
import SearchView from './routes/collection.vue';

export default defineModule({
	id: 'search',
	name: 'Search',
	icon: '⌕',
	routes: [{ path: '', name: 'index', component: SearchView }],
});
