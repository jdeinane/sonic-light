import express from 'express';
import { normalizeUsername, parseDrawing } from './validation.js';

/**
 * Builds the Express app without starting it (handy for tests).
 * @param {object} db Data access object returned by openDb().
 * @param {{ adminUsername?: string }} options Username allowed to use the admin routes.
 * @returns {import('express').Express}
 */
export function createApp(db, { adminUsername = 'admin' } = {}) {
	const app = express();
	app.use(express.json({ limit: '2mb' }));

	const isAdmin = (username) => username.toLowerCase() === adminUsername.toLowerCase();

	// Login route
	app.post('/api/login', (req, res) => {
		const username = normalizeUsername(req.body?.username);
		if (!username)
			return res.status(400).json({ error: 'Invalid username (must be between 1 to 32 characters).'});

		const user = db.findOrCreateUser(username);
		res.json({ username: user.username, isAdmin: isAdmin(user.username) });
	});

	// Middlewares
	const requireUser = (req, res, next) => {
		const username = normalizeUsername(req.get('X-Username'));
		if (!username)
			return res.status(401).json({ error: 'Identification required.' });
		req.user = db.findOrCreateUser(username);
		next();
	};

	const requireAdmin = (req, res, next) => {
		if (!isAdmin(req.user.username))
			return res.status(403).json({ error: 'Access restricted to the administrator.' });
		next();
	};

	// Drawing routes
	app.get('/api/drawing', requireUser, (req, res) => {
		const saved = db.getDrawing(req.user.id);
		res.json(saved ?? { drawing: null, updatedAt: null });
	});
	
	app.put('/api/drawing', requireUser, (req, res) => {
		const drawing = parseDrawing(req.body);
		if (!drawing)
			return res.status(400).json({ error: 'Invalid drawing.' });
		res.json({ updatedAt: db.saveDrawing(req.user.id, drawing) });
	});

	app.get('/api/admin/drawings', requireUser, requireAdmin, (_req, res) => {
		res.json(db.listDrawings());
	});

	// Error handling
	app.use('/api', (_req, res) => res.status(404).json({ error: 'Unknown route.' }));

	app.use((err, _req, res, _next) => {
		const status = err.status ?? 500;
		if (status === 500)
			console.error(err);
		res.status(status).json({ error: status === 500 ? 'Server error.' : 'Invalid request.' });
	});

	return app;
}
