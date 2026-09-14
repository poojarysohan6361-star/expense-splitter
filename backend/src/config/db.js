import pg from 'pg';
import dotenv from 'dotenv';
 
dotenv.config();
 
const { Pool } = pg;
 
// Single shared connection pool. Every query in the app should go through
// this — no raw `new Client()` calls scattered around controllers/services.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
 
pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
  process.exit(1);
});
 
// Small helper so services don't need to import `pool` everywhere —
// they can just call query(text, params).
export const query = (text, params) => pool.query(text, params);
 
// Runs `callback` with a single client checked out from the pool, wrapped in
// BEGIN/COMMIT/ROLLBACK. Use this whenever multiple writes need to succeed or
// fail together (e.g. creating a group and adding its creator as a member).
// `callback` receives the client and should use it (not `query`/`pool`) for
// every statement that needs to be part of the transaction.
export const withTransaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};
 