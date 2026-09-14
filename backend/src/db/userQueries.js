import { query } from '../config/db.js';

export const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id) => {
  const result = await query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
};

export const createUser = async ({ name, email, passwordHash }) => {
  const result = await query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
};