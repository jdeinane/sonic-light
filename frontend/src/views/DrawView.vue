<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DrawingCanvas from '../components/DrawingCanvas.vue';
import { api } from '../api';
import { clearSession, session } from '../session';

const router = useRouter();
const strokes = ref([]);
const color = ref('#000000');
const lineWidth = ref(4);
const loading = ref(true);
const saving = ref(false);
const message = ref('');
const error = ref('');

onMounted(async () => {
	try {
		const { drawing, updatedAt } = await api.getDrawing();
		strokes.value = drawing?.strokes ?? [];
		if (updatedAt)
			message.value = `Last saved on ${new Date(updatedAt).toLocaleString()}`;
	} catch (e) {
		error.value = e.message;
	} finally {
		loading.value = false;
	}
});

const undo = () => {
	strokes.value = strokes.value.slice(0, -1);
};
const clear = () => {
	strokes.value = [];
};

async function save() {
	error.value = '';
	message.value = '';
	saving.value = true;
	try {
		const { updatedAt } = await api.saveDrawing(strokes.value);
		message.value = `Saved on ${new Date(updatedAt).toLocaleString()}`;
	} catch (e) {
		error.value = e.message;
	} finally {
		saving.value = false;
	}
}

function logout() {
	clearSession();
	router.push('/');
}
</script>

<template>
	<main class="draw">
		<header>
			<h1>Ready to draw, {{ session.username }} ?</h1>
			<button type="button" @click="logout">Sign out</button>
		</header>

		<p v-if="loading">Loading your drawing…</p>
		<template v-else>
			<div class="toolbar">
				<label>
					Color
					<input v-model="color" type="color" />
				</label>
				<label>
					Width {{ lineWidth }}
					<input v-model.number="lineWidth" type="range" min="1" max="40" />
				</label>
				<button type="button" :disabled="!strokes.length" @click="undo">Undo</button>
				<button type="button" :disabled="!strokes.length" @click="clear">Clear</button>
				<button type="button" :disabled="saving" @click="save">
					{{ saving ? 'Saving…' : 'Save' }}
				</button>
			</div>

			<DrawingCanvas v-model:strokes="strokes" :color="color" :line-width="lineWidth" />

			<p v-if="message" role="status">{{ message }}</p>
		</template>
		<p v-if="error" class="error" role="alert">{{ error }}</p>
	</main>
</template>

<style scoped>
.draw {
	max-width: 800px;
	margin: 1rem auto;
	padding: 0 1rem;
}
header,
.toolbar {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}
.error {
	color: #b00020;
}
</style>
