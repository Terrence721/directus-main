<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useItems } from '@directus/composables';

interface Props {
	collection: string;
	itemId: string;
}

const props = defineProps<Props>();

const itemsInstance = useItems(props.collection);
const itemData = computed(() => {
	const found = itemsInstance.data.value?.find((i) => String(i.id) === props.itemId);
	return found ?? null;
});

watch(
	() => props.collection,
	() => {
		itemsInstance.refresh();
	},
);

onMounted(() => {
	itemsInstance.refresh();
});
</script>

<template>
	<slot :item="itemData" :loading="itemsInstance.loading.value" :error="itemsInstance.error.value" />
</template>
