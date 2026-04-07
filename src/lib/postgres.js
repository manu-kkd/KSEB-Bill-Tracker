import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('Please define DATABASE_URL in .env.local with your PostgreSQL connection string');
}

const pool = global.pgPool || new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export default pool;
