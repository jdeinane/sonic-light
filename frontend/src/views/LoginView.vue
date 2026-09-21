<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '../api';
import { session, setSession } from '../session';

const router = useRouter();
const username = ref(session.username ?? '');
const error = ref('');
const loading = ref(false);

async function submit() {
	error.value = '';
	loading.value = true;
	try {
		const user = await api.login(username.value);
		setSession(user);
		router.push(user.isAdmin ? '/admin' : '/draw');
	} catch (e) {
		error.value = e.message;
	} finally {
		loading.value = false;
	}
}
</script>

<template>
	<main class="login">
		<h1>SonicLight</h1>
		<p>Enter a username to draw and find your drawing later.</p>

		<form @submit.prevent="submit">
			<label for="username">Username</label>
			<input
				id="username"
				v-model="username"
				maxlength="32"
				autocomplete="username"
				required
				autofocus
			/>
			<button type="submit" :disabled="loading">
				{{ loading ? 'Signing in…' : 'Continue' }}
			</button>
			<p v-if="error" class="error" role="alert">{{ error }}</p>
		</form>
	</main>
</template>

<style scoped>
.login {
	max-width: 24rem;
	margin: 4rem auto;
	padding: 0 1rem;
}
form {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
}
input,
button {
	padding: 0.5rem;
	font: inherit;
}
.error {
	color: #b00020;
}
</style>
