const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const contents = fs.readFileSync(envPath, 'utf8');
  contents.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [key, ...valueParts] = trimmed.split('=');
    if (!key) return;
    const value = valueParts.join('=').trim();
    process.env[key.trim()] = value;
  });
}

const envFile = path.resolve(__dirname, '..', '.env.local');
loadEnv(envFile);

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Missing DATABASE_URL in .env.local or environment.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        billing_date DATE NOT NULL,
        units_consumed INTEGER NOT NULL,
        amount_paid NUMERIC(10,2) NOT NULL,
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Migration completed: bills table exists.');
  } catch (error) {
    console.error('Migration failed:', error.message || error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
