import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutCurrentSession,
  registerUser,
} from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function bootstrapSession() {
      try {
        const user = await getCurrentUser();
        if (mounted) {
          setSession(user);
        }
      } catch {
        if (mounted) {
          setSession(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    bootstrapSession();
    return () => {
      mounted = false;
    };
  }, []);

  async function login({ email, password }) {
    const response = await loginUser({ email, password });
    const nextSession = response?.user || null;
    setSession(nextSession);
    return nextSession;
  }

  async function register({ name, email, password }) {
    const response = await registerUser({ name, email, password });
    const nextSession = response?.user || null;
    setSession(nextSession);
    return nextSession;
  }

  async function logout() {
    try {
      await logoutCurrentSession();
    } catch {
      // Ensure local state is cleared even if API call fails.
    }
    setSession(null);
  }

  function updateProfile(payload) {
    setSession((prev) => {
      if (!prev) return prev;
      const nextSession = {
        ...prev,
        ...payload,
      };
      return nextSession;
    });
  }

  const value = useMemo(
    () => ({
      session,
      user: session,
      loading,
      isAuthenticated: Boolean(session),
      login,
      register,
      logout,
      updateProfile,
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
