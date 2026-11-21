import { useAuthStore } from '@directus/stores';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router.js';
import { initSessionPersistence } from './sessionPersistence.js';
import { initSessionSync } from '@directus/composables';
import './style.css';

const app = createApp(App);

app.use(createPinia());
initSessionPersistence(useAuthStore());
initSessionSync();
app.use(router);

app.mount('#app');
