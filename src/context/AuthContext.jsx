import { createContext, useContext, useState, useCallback } from 'react';
import { loginUser, registerUser } from '../api/auth.api';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Multi-Admin RBAC helpers, used by the admin panel section of the app.
// super_admin/admin: full access by default (matches how the app already
// behaved before RBAC existed, so nothing breaks for existing accounts).
// moderator: limited to whatever's in user.permissions.
export function can(user, permission) {
  if (!user) return false;
  if (user.role === 'super_admin' || user.role === 'admin') return true;
  return (user.permissions || []).includes(permission);
}

export function isSuperAdmin(user) {
  return user?.role === 'super_admin';
}

export function isStaff(user) {
  return ['moderator', 'admin', 'super_admin'].includes(user?.role);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser());

  const persistSession = useCallback((sessionUser, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('authUser', JSON.stringify(sessionUser));
    setUser(sessionUser);
  }, []);

  const login = useCallback(
    async (identifier, password) => {
      const { user: loggedInUser, tokens } = await loginUser(identifier, password);
      persistSession(loggedInUser, tokens);
      return loggedInUser;
    },
    [persistSession]
  );

  const register = useCallback(
    async (payload) => {
      const { user: newUser, tokens } = await registerUser(payload);
      persistSession(newUser, tokens);
      return newUser;
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authUser');
    setUser(null);
  }, []);

  const value = { user, isAuthenticated: !!user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
