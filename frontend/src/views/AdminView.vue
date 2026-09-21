<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import DrawingCanvas from '../components/DrawingCanvas.vue';
import { api } from '../api';
import { clearSession } from '../session';

const router = useRouter();
const drawings = ref([]);
const loading = ref(true);
const error = ref('');

async function load() {
	error.value = '';
	loading.value = true;
	try {
		drawings.value = await api.listDrawings();
	} catch (e) {
		error.value = e.message;
	} finally {
		loading.value = false;
	}
}

onMounted(load);

function logout() {
	clearSession();
	router.push('/');
}
</script>

<template>
	<main class="admin">
		<header>
			<h1>Drawings</h1>
			<div>
				<button type="button" :disabled="loading" @click="load">Refresh</button>
				<button type="button" @click="logout">Sign out</button>
			</div>
		</header>

		<p v-if="loading">Loading…</p>
		<p v-else-if="error" class="error" role="alert">{{ error }}</p>
		<p v-else-if="!drawings.length">No drawing saved yet.</p>

		<ul v-else class="gallery">
			<li v-for="item in drawings" :key="item.username">
				<h2>{{ item.username }}</h2>
				<DrawingCanvas :strokes="item.drawing.strokes" readonly />
				<p class="meta">
					{{ item.drawing.strokes.length }} strokes ·
					{{ new Date(item.updatedAt).toLocaleString() }}
				</p>
			</li>
		</ul>
	</main>
</template>


<style scoped>
.admin {
	max-width: 1100px;
	margin: 1rem auto;
	padding: 0 1rem;
}
header {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.75rem;
	margin-bottom: 1rem;
}
header div {
	display: flex;
	gap: 0.5rem;
}
.gallery {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	gap: 1rem;
	padding: 0;
	list-style: none;
}
h2 {
	margin: 0 0 0.5rem;
	font-size: 1rem;
}
.meta {
	margin: 0.25rem 0 0;
	font-size: 0.85rem;
	color: #555;
}
.error {
	color: #b00020;
}
</style>