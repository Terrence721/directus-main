<script setup lang="ts">
import type { CollectionInfo } from '@directus/composables';

defineProps<{
	collection: CollectionInfo;
	selected: boolean;
}>();

defineEmits<{ click: [] }>();
</script>

<template>
	<button class="coll-group" :class="{ 'coll-group--active': selected }" type="button" @click="$emit('click')">
		<span class="coll-group__name">{{ collection.label }}</span>
		<span class="coll-group__count">{{ collection.sampleCount }}</span>
	</button>
</template>

<style scoped>
.coll-group {
	display: flex;
	align-items: center;
	justify-content: space-between;
	inline-size: 100%;
	padding: 0.5rem 0.75rem;
	background: none;
	border: none;
	border-radius: 0.375rem;
	cursor: pointer;
	font: inherit;
	font-size: 0.8125rem;
	color: var(--ink);
	text-align: start;
	transition: background 0.1s;
}

.coll-group:hover {
	background: var(--paper-2);
}

.coll-group--active {
	background: var(--accent);
	color: var(--accent-ink);
}

.coll-group--active:hover {
	filter: brightness(0.95);
}

.coll-group__name {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.coll-group__count {
	font-size: 0.75rem;
	opacity: 0.65;
	flex-shrink: 0;
	margin-inline-start: 0.5rem;
}
</style>
