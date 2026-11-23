<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@directus/stores';
import { useRouter, initSessionSync } from '@directus/composables';
import { hydrate, projectName, useHydrationState } from './hydrate.js';

const auth = useAuthStore();
const { push } = useRouter();
const { hydrating, hydrationError } = useHydrationState();

const open = ref(false);
const darkMode = ref(false);

initSessionSync();

onMounted(() => {
	const stored = localStorage.getItem('darkMode');
	if (stored !== null) {
		darkMode.value = stored === 'true';
	} else {
		darkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
	updateTheme();
});

onMounted(async () => {
	await hydrate();
});

function updateTheme() {
	document.documentElement.setAttribute('data-theme', darkMode.value ? 'dark' : 'light');
	localStorage.setItem('darkMode', String(darkMode.value));
}

function toggleDarkMode() {
	darkMode.value = !darkMode.value;
	updateTheme();
}

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
				<button class="nav-btn" @click="push('/users')"><span class="nav-btn__icon">👤</span> Users</button>
				<button class="nav-btn" @click="push('/activity')"><span class="nav-btn__icon">📋</span> Activity</button>
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
				<button class="theme-toggle" :aria-pressed="darkMode" @click="toggleDarkMode">
					<span class="theme-toggle__icon">{{ darkMode ? '☀️' : '🌙' }}</span>
					<span>{{ darkMode ? 'Light' : 'Dark' }}</span>
				</button>
			</header>
			<main class="main">
				<p v-if="hydrating" class="hydration-loading">Loading…</p>
				<p v-else-if="hydrationError" class="hydration-error">Something went wrong.</p>
				<RouterView v-else />
			</main>
		</div>
	</div>
</template>

<style scoped>
.layout {
	display: flex;
	min-block-size: 100vh;
	position: relative;
}

.sidebar {
	inline-size: 180px;
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
	border-block-end: 1px solid rgb(255 255 255 / 8%);
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
	background: rgb(255 255 255 / 8%);
}

.nav-btn__icon {
	font-size: 1rem;
	opacity: 0.7;
}

.sidebar__footer {
	padding: 1rem;
	border-block-start: 1px solid rgb(255 255 255 / 8%);
}

.logout-btn {
	inline-size: 100%;
	padding: 0.5rem;
	background: transparent;
	border: 1px solid rgb(255 255 255 / 20%);
	color: inherit;
	font: inherit;
	font-size: 0.8125rem;
	border-radius: 0.375rem;
	cursor: pointer;
	transition: background 0.15s;
}

.logout-btn:hover {
	background: rgb(255 255 255 / 8%);
}

.shell {
	flex: 1;
	display: flex;
	flex-direction: column;
	margin-inline-start: 180px;
	inline-size: calc(100% - 180px);
}

.header {
	display: flex;
	align-items: center;
	padding: 0.75rem 1.25rem;
	background: var(--paper-2);
	border-block-end: 1px solid var(--rule);
	gap: 1rem;
	position: sticky;
	inset-block-start: 0;
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

@media (width <= 768px) {
	.sidebar {
		transform: translateX(-100%);
	}

	.layout--open .sidebar {
		transform: translateX(0);
	}

	.shell {
		margin-inline-start: 0;
		inline-size: 100%;
	}

	.hamburger {
		display: block;
	}
}
</style>
