import { defineModule } from '../defineModule.js';
import FilesView from './routes/collection.vue';

export default defineModule({
	id: 'files',
	name: 'Files',
	icon: '▲',
	routes: [{ path: '', name: 'index', component: FilesView }],
});
