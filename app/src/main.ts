import { useAuthStore } from '@directus/stores';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router.js';
import { initSessionPersistence } from './sessionPersistence.js';
import './style.css';

const app = createApp(App);

app.use(createPinia());
initSessionPersistence(useAuthStore());
app.use(router);

app.mount('#app');
