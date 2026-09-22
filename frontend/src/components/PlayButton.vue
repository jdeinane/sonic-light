<script setup>
import { onBeforeUnmount, ref } from 'vue';
import { playDrawing } from '../audio';

const props = defineProps({
	strokes: { type: Array, required: true },
});

const playing = ref(false);
let player = null;

function stop() {
	player?.stop();
}

function toggle() {
	if (playing.value)
		return stop();
	playing.value = true;
	player = playDrawing(props.strokes, () => {
		playing.value = false;
		player = null;
	});
}

onBeforeUnmount(stop);
</script>

<template>
	<button type="button" :disabled="!strokes.length" @click="toggle">
		{{ playing ? 'Stop' : 'Listen' }}
	</button>
</template>
