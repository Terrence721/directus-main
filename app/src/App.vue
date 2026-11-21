<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAppStore, useAuthStore, useServerStore } from '@directus/stores';
import { fetchServerInfo, useRouter } from '@directus/composables';

const auth = useAuthStore();
const server = useServerStore();
const app = useAppStore();
const { push } = useRouter();

const projectName = ref('');
const open = ref(false);

onMounted(async () => {
	app.startHydration();
	try {
		const info = await fetchServerInfo();
		server.setInfo(info);
		projectName.value = info.projectName;
	} catch (err) {
		app.failHydration(err instanceof Error ? err : new Error(String(err)));
	}
	app.completeHydration();
});

async function handleLogout() {
	auth.clearSession();
	await push('/login');
}
</script>

<template>
	<div class="layout" :class="{ 'layout--open': open }">
		<!-- Sidebar -->
		<aside class="sidebar">
			<div class="sidebar__brand">{{ projectName || 'Admin' }}</div>
			<nav class="sidebar__nav">
				<button class="nav-btn" @click="push('/')"><span class="nav-btn__icon">⌂</span> Home</button>
				<button class="nav-btn" @click="push('/items')"><span class="nav-btn__icon">☰</span> Items</button>
				<button class="nav-btn" @click="push('/search')"><span class="nav-btn__icon">⌕</span> Search</button>
				<button class="nav-btn" @click="push('/files')"><span class="nav-btn__icon">▲</span> Files</button>
			</nav>
			<div class="sidebar__footer">
				<button class="logout-btn" @click="handleLogout">Log out</button>
			</div>
		</aside>

		<!-- Main area -->
		<div class="shell">
			<header class="header">
				<button class="hamburger" aria-label="Toggle navigation" @click="open = !open">☰</button>
				<div class="header__spacer"></div>
			</header>
			<main class="main">
				<p v-if="app.hydrating" class="hydration-loading">Loading…</p>
				<p v-else-if="app.hydrationError" class="hydration-error">Something went wrong.</p>
				<RouterView v-else />
			</main>
		</div>
	</div>
</template>

<style scoped>
.layout {
	display: flex;
	min-height: 100vh;
	position: relative;
}

.sidebar {
	width: 180px;
	flex-shrink: 0;
	background: var(--ink);
	color: var(--paper);
	display: flex;
	flex-direction: column;
	position: fixed;
	inset-block: 0;
	inset-inline-start: 0;
	z-index: 100;
	transition: transform 0.2s ease;
}

.sidebar__brand {
	padding: 1.25rem 1rem;
	font-weight: 700;
	font-size: 0.9375rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	letter-spacing: 0.02em;
}

.sidebar__nav {
	flex: 1;
	padding: 0.5rem 0;
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.nav-btn {
	display: flex;
	align-items: center;
	gap: 0.625rem;
	padding: 0.625rem 1rem;
	background: none;
	border: none;
	color: inherit;
	font: inherit;
	font-size: 0.875rem;
	cursor: pointer;
	text-align: start;
	border-radius: 0;
	transition: background 0.15s;
}

.nav-btn:hover {
	background: rgba(255, 255, 255, 0.08);
}

.nav-btn__icon {
	font-size: 1rem;
	opacity: 0.7;
}

.sidebar__footer {
	padding: 1rem;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.logout-btn {
	width: 100%;
	padding: 0.5rem;
	background: transparent;
	border: 1px solid rgba(255, 255, 255, 0.2);
	color: inherit;
	font: inherit;
	font-size: 0.8125rem;
	border-radius: 0.375rem;
	cursor: pointer;
	transition: background 0.15s;
}

.logout-btn:hover {
	background: rgba(255, 255, 255, 0.08);
}

.shell {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin-inline-start: 180px;
	width: calc(100% - 180px);
}

.header {
	display: flex;
	align-items: center;
	padding: 0.75rem 1.25rem;
	background: var(--paper-2);
	border-bottom: 1px solid var(--rule);
	gap: 1rem;
	position: sticky;
	top: 0;
	z-index: 50;
}

.hamburger {
	display: none;
	background: none;
	border: none;
	font-size: 1.25rem;
	cursor: pointer;
	color: var(--ink);
	padding: 0.25rem;
}

.header__spacer {
	flex: 1;
}

.main {
	flex: 1;
	padding: 1.5rem;
	overflow-y: auto;
}

@media (max-width: 768px) {
	.sidebar {
		transform: translateX(-100%);
	}

	.layout--open .sidebar {
		transform: translateX(0);
	}

	.shell {
		margin-inline-start: 0;
		width: 100%;
	}

	.hamburger {
		display: block;
	}
}
</style>
