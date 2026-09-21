import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { createApp } from './app.js';
import { openDb } from './db.js';

const dbPath = process.env.DB_PATH ?? './data/soniclight.db';
const port = Number(process.env.PORT ?? 3000);

mkdirSync(dirname(dbPath), { recursive: true });

const app = createApp(openDb(dbPath), {
	adminUsername: process.env.ADMIN_USERNAME ?? 'admin',
});

app.listen(port, () => console.log(`SonicLight API on: http://localhost:${port}`));
