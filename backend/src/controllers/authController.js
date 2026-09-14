import { registerUser, loginUser } from '../services/authService.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'password must be at least 8 characters' });
    }

    const { user, token } = await registerUser({ name, email, password });
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { user, token } = await loginUser({ email, password });
    res.json({ user, token });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
