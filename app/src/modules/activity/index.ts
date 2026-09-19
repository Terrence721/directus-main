import { defineModule } from '../defineModule.js';
import ActivityCollection from './routes/collection.vue';

export default defineModule({
	id: 'activity',
	hidden: true,
	name: 'Activity',
	icon: 'notifications',
	routes: [
		{
			name: 'activity-collection',
			path: '',
			component: ActivityCollection,
		},
	],
});
