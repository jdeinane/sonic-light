import { reactive } from 'vue';

const KEY = 'soniclight-session';

function load() {
	try {
		return JSON.parse(localStorage.getItem(KEY)) ?? {};
	} catch {
		return {};
	}
}

export const session = reactive({
	username: load().username ?? null,
	isAdmin: load().isAdmin ?? false,
});

export function setSession({ username, isAdmin }) {
	session.username = username;
	session.isAdmin = isAdmin;
	localStorage.setItem(KEY, JSON.stringify({ username, isAdmin }));
}

export function clearSession() {
	session.username = null;
	session.isAdmin = false;
	localStorage.removeItem(KEY);
}
