import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../db/userQueries.js';

const SALT_ROUNDS = 10;

export const registerUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await createUser({ name, email, passwordHash });
  const token = signToken(user);

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }

  const token = signToken(user);
  // Strip the hash before returning the user object anywhere.
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
};

const signToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
