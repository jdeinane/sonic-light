import { createRouter, createWebHistory } from 'vue-router';
import { session } from '../session';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'login', component: () => import('../views/LoginView.vue') },
		{
			path: '/draw',
			name: 'draw',
			component: () => import('../views/DrawView.vue'),
			meta: { requiresAuth: true },
		},
		{
			path: '/admin',
			name: 'admin',
			component: () => import('../views/AdminView.vue'),
			meta: { requiresAuth: true, requiresAdmin: true },
		},
		{ path: '/:pathMatch(.*)*', redirect: '/' },
	],
});

router.beforeEach((to) => {
	if (to.meta.requiresAuth && !session.username)
		return '/';
	if (to.meta.requiresAdmin && !session.isAdmin)
		return '/draw';
});

export default router;
