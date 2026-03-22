import React, { createContext, useContext, useMemo, useState } from 'react';

const AUTH_STORAGE_KEY = 'mathLabAuthSession';

const AuthContext = createContext(null);

function loadStoredSession() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures for local demo auth sessions.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadStoredSession());

  function login({ email, name }) {
    const normalizedEmail = email?.trim() || 'demo-admin@mathlab.edu';
    const nextSession = {
      id: 'demo-user-1',
      email: normalizedEmail,
      name: name || normalizedEmail.split('@')[0] || 'Demo User',
      role: 'demo',
      isDemoSession: true,
      signedAt: new Date().toISOString(),
    };
    setSession(nextSession);
    saveStoredSession(nextSession);
    return nextSession;
  }

  function logout() {
    setSession(null);
    saveStoredSession(null);
  }

  function updateProfile(payload) {
    setSession((prev) => {
      if (!prev) return prev;
      const nextSession = {
        ...prev,
        ...payload,
      };
      saveStoredSession(nextSession);
      return nextSession;
    });
  }

  const value = useMemo(
    () => ({
      session,
      user: session,
      isAuthenticated: Boolean(session),
      login,
      logout,
      updateProfile,
    }),
    [session],
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
