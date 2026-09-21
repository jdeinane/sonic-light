<script setup>
import { onMounted, ref, watch } from 'vue';
import { CANVAS, renderStrokes } from '../drawing';

const props = defineProps({
	color: { type: String, default: '#000000' },
	lineWidth: { type: Number, default: 4 },
	readonly: Boolean,
});
const strokes = defineModel('strokes', { default: () => [] });

const canvas = ref(null);
const current = ref(null);

function redraw() {
	const all = current.value ? [...strokes.value, current.value] : strokes.value;
	renderStrokes(canvas.value.getContext('2d'), all);
}

onMounted(redraw);
watch(strokes, redraw);

const clamp = (value, max) => Math.min(max, Math.max(0, value));

function position(event) {
	const rect = canvas.value.getBoundingClientRect();
	const x = ((event.clientX - rect.left) / rect.width) * CANVAS.width;
	const y = ((event.clientY - rect.top) / rect.height) * CANVAS.height;
	return [clamp(Math.round(x), CANVAS.width), clamp(Math.round(y), CANVAS.height)];
}

function start(event) {
	if (props.readonly || event.button !== 0)
		return;
	canvas.value.setPointerCapture(event.pointerId);
	current.value = { color: props.color, width: props.lineWidth, points: [position(event)] };
	redraw();
}

function move(event) {
	if (!current.value)
		return;
	current.value.points.push(position(event));
	redraw();
}

function end() {
	if (!current.value)
		return;
	const finished = current.value;
	current.value = null;
	strokes.value = [...strokes.value, finished];
}
</script>

<template>
	<canvas
		ref="canvas"
		:width="CANVAS.width"
		:height="CANVAS.height"
		:class="{ readonly }"
		@pointerdown="start"
		@pointermove="move"
		@pointerup="end"
		@pointercancel="end"
	></canvas>
</template>

<style scoped>
canvas {
	display: block;
	width: 100%;
	max-width: 800px;
	height: auto;
	border: 1px solid #ccc;
	background: #fff;
	cursor: crosshair;
	touch-action: none;
}
canvas.readonly {
	cursor: default;
}
</style>
