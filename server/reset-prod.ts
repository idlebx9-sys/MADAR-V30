import fs from 'fs';
import path from 'path';
import { createEmptyProductionDB } from './db.ts';

async function run() {
  const DATA_DIR = path.resolve(process.cwd(), 'data');
  const DB_FILE = path.join(DATA_DIR, 'madar-db.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const emptyDB = createEmptyProductionDB();
  fs.writeFileSync(DB_FILE, JSON.stringify(emptyDB, null, 2), 'utf-8');
  console.log('Production database initialized completely clean (Zero demo data, Zero fake metrics).');
}

run().catch((err) => {
  console.error('Reset error:', err);
  process.exit(1);
});
