import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { openDb } from '../src/db.js';

async function start() {
	const db = openDb();
	const server = createApp(db, { adminUsername: 'admin' }).listen(0);
	const base = `http://localhost:${server.address().port}`;

	const call = async (method, path, { user, body } = {}) => {
		const res = await fetch(base + path, {
			method,
			headers: {
				'Content-Type': 'application/json',
				...(user && { 'X-Username': user }),
			},
			body: body && JSON.stringify(body),
		});
		return { status: res.status, json: await res.json() };
	};

	return { call, stop: () => { server.close(); db.close(); } };
}

const stroke = (x) => ({ color: '#ff0000', width: 4, points: [[x, 10], [x + 5, 20]] });


test('login creates or finds a user and flags the admin', async () => {
	const { call, stop } = await start();

	const alice = await call('POST', '/api/login', { body: { username: ' alice ' } });
	assert.deepEqual(alice.json, { username: 'alice', isAdmin: false });

	const admin = await call('POST', '/api/login', { body: { username: 'Admin' } });
	assert.equal(admin.json.isAdmin, true);

	const empty = await call('POST', '/api/login', { body: { username: '' } });
	assert.equal(empty.status, 400);

	stop();
});


test('a new drawing replaces the previous one', async () => {
	const { call, stop } = await start();

	const before = await call('GET', '/api/drawing', { user: 'bob' });
	assert.equal(before.json.drawing, null);

	await call('PUT', '/api/drawing', { user: 'bob', body: { strokes: [stroke(1)] } });
	await call('PUT', '/api/drawing', { user: 'bob', body: { strokes: [stroke(2), stroke(3)] } });

	const after = await call('GET', '/api/drawing', { user: 'bob' });
	assert.equal(after.json.drawing.strokes.length, 2);

	const sameUser = await call('GET', '/api/drawing', { user: 'BOB' });
	assert.equal(sameUser.json.drawing.strokes.length, 2);

	stop();
});


test('invalid drawings and missing identification are rejected', async () => {
	const { call, stop } = await start();

	const invalid = [
		{ strokes: 'x' },
		{ strokes: [{ ...stroke(1), color: 'red' }] },
		{ strokes: [{ ...stroke(1), points: [[9999, 0]] }] },
	];
	for (const body of invalid) {
		const res = await call('PUT', '/api/drawing', { user: 'bob', body });
		assert.equal(res.status, 400);
	}

	const anonymous = await call('PUT', '/api/drawing', { body: { strokes: [] } });
	assert.equal(anonymous.status, 401);

	stop();
});


test('only the admin can list every drawing', async () => {
	const { call, stop } = await start();

	await call('PUT', '/api/drawing', { user: 'alice', body: { strokes: [stroke(1)] } });
	await call('PUT', '/api/drawing', { user: 'bob', body: { strokes: [stroke(2)] } });

	const forbidden = await call('GET', '/api/admin/drawings', { user: 'alice' });
	assert.equal(forbidden.status, 403);

	const list = await call('GET', '/api/admin/drawings', { user: 'admin' });
	assert.deepEqual(list.json.map((d) => d.username).sort(), ['alice', 'bob']);

	stop();
});
