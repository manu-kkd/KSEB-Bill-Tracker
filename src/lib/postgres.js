import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Please define DATABASE_URL in .env.local with your PostgreSQL connection string');
}

const pool = global.pgPool || new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

let initialized = false;

async function ensureBillsTable() {
  if (initialized) return;

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

  initialized = true;
}

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export default pool;
export { ensureBillsTable };
