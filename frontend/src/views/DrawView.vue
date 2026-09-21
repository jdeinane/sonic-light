<script setup>
import { session } from '../session';
</script>

<template>
	<main>
		<h1>Drawing page</h1>
		<p>Signed in as {{ session.username }}</p>
	</main>
</template>
