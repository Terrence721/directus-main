<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
	modelValue: string[];
	fields: Array<{ name: string; type: string }>;
}>();

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();

const showPanel = ref(false);

const availableFields = computed(() => props.fields.filter((f) => !props.modelValue.includes(f.name)));

function toggle(field: string) {
	if (props.modelValue.includes(field)) {
		emit(
			'update:modelValue',
			props.modelValue.filter((f) => f !== field),
		);
	} else {
		emit('update:modelValue', [...props.modelValue, field]);
	}
}

function toggleAll() {
	if (availableFields.value.length === 0) {
		emit('update:modelValue', []);
	} else {
		emit('update:modelValue', [...props.fields.map((f) => f.name)]);
	}
}
</script>

<template>
	<div class="field-picker">
		<button class="field-picker__toggle" @click="showPanel = !showPanel" type="button">
			Columns · {{ modelValue.length }}
		</button>

		<div v-if="showPanel" class="field-picker__panel">
			<button class="field-picker__select-all" @click="toggleAll" type="button">
				{{ availableFields.length > 0 ? 'Select all' : 'Deselect all' }}
			</button>
			<div class="field-list">
				<label v-for="field in fields" :key="field.name" class="field-item">
					<input type="checkbox" :checked="modelValue.includes(field.name)" @change="toggle(field.name)" />
					<span>{{ field.name }}</span>
				</label>
			</div>
		</div>
	</div>
</template>

<style scoped>
.field-picker {
	position: relative;
}

.field-picker__toggle {
	padding: 0.375rem 0.75rem;
	font: inherit;
	font-size: 0.8125rem;
	background: var(--paper-2);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	cursor: pointer;
	color: var(--ink);
}

.field-picker__toggle:hover {
	border-color: var(--accent);
}

.field-picker__panel {
	position: absolute;
	top: calc(100% + 0.25rem);
	left: 0;
	background: var(--paper);
	border: 1px solid var(--rule);
	border-radius: 0.375rem;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	z-index: 10;
	min-width: 160px;
	max-height: 240px;
	overflow-y: auto;
	padding: 0.5rem 0;
}

.field-picker__select-all {
	display: block;
	width: 100%;
	padding: 0.375rem 0.75rem;
	background: none;
	border: none;
	border-bottom: 1px solid var(--rule);
	font: inherit;
	font-size: 0.75rem;
	color: var(--accent);
	cursor: pointer;
	text-align: start;
}

.field-picker__select-all:hover {
	background: var(--paper-2);
}

.field-list {
	padding: 0.25rem 0;
}

.field-item {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.375rem 0.75rem;
	font-size: 0.8125rem;
	cursor: pointer;
}

.field-item:hover {
	background: var(--paper-2);
}

.field-item input[type='checkbox'] {
	cursor: pointer;
}
</style>
