import { useState, useCallback } from 'react';
import * as authService from '../services/authService.js';

export function useAuth() {
  const [user, setUser] = useState(() => authService.getStoredUser());

  const login = useCallback(async (credentials) => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const signup = useCallback(async (details) => {
    const newUser = await authService.signup(details);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return { user, login, signup, logout, isAuthenticated: !!user };
}
