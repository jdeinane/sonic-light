import Database from 'better-sqlite3';

/**
 * Open (or create) SQLite database and return access functions to data
 * @param {string} path Filepath, or ':memory:' for a temporary database 
 */
export function openDb(path = ':memory:') {
	const db = new Database(path);
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');

	db.exec(`
		CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE COLLATE NOCASE
		);

		CREATE TABLE IF NOT EXISTS drawings (
		user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		data TEXT NOT NULL,
		updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
		);
	`)


	const findOrCreateUser = db.transaction((username) => {
		db.prepare('INSERT OR IGNORE INTO users (username) VALUES (?)').run(username);
		return db.prepare('SELECT id, username FROM users WHERE username =?').get(username);
	});


	const upsertDrawing = db.prepare(`
		INSERT INTO drawings (user_id, data) VALUES (?, ?)
		ON CONFLICT(user_id) DO UPDATE SET
			data = excluded.data,
			updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
		RETURNING updated_at
	`);


	const selectDrawing = db.prepare('SELECT data, updated_at FROM drawings WHERE user_id = ?');


	const selectAllDrawings = db.prepare(`
		SELECT u.username, d.data, d.updated_at
		FROM drawings d JOIN users u ON u.id = d.user_id
		ORDER BY d.updated_at DESC
	`);


	return {
		close: () => db.close(),
		findOrCreateUser,
		saveDrawing: (userId, drawing) =>
			upsertDrawing.get(userId, JSON.stringify(drawing)).updated_at,
		getDrawing: (userId) => {
			const row = selectDrawing.get(userId);
			return row && { drawing:JSON.parse(row.data), updatedAt: row.updated_at };
		},
		listDrawings: () =>
			selectAllDrawings.all().map((r) => ({
				username: r.username,
				drawing: JSON.parse(r.data),
				updatedAt: r.updated_at,
			})),
	};
}
