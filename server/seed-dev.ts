import fs from 'fs';
import path from 'path';
import { getDevelopmentSeed } from './dev-seed.ts';

async function run() {
  if (process.env.NODE_ENV === 'production' || process.env.MADAR_ENV === 'production') {
    console.error('FATAL: Cannot run development seed in production environment!');
    process.exit(1);
  }

  const DATA_DIR = path.resolve(process.cwd(), 'data');
  const DB_FILE = path.join(DATA_DIR, 'madar-db.json');

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const seed = await getDevelopmentSeed();
  fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8');
  console.log('Successfully seeded development database to data/madar-db.json');
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
