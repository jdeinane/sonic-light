import { session } from './session';

async function request(method, path, body) {
	const headers = { 'Content-Type': 'application/json' };
	if (session.username)
		headers['X-Username'] = session.username;

	const options = { method, headers };
	if (body !== undefined)
		options.body = JSON.stringify(body);

	const res = await fetch(path, options);

	const data = await res.json().catch(() => null);
	if (!res.ok)
		throw new Error(data?.error ?? `Request failed (${res.status})`);
	return data;
}

export const api = {
	login: (username) => request('POST', '/api/login', { username }),
	getDrawing: () => request('GET', '/api/drawing'),
	saveDrawing: (strokes) => request('PUT', '/api/drawing', { strokes }),
	listDrawings: () => request('GET', '/api/admin/drawings'),
};
