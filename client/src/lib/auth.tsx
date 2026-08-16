"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "./api";
import { useRouteTransition } from "./route-transition";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { navigate } = useRouteTransition();

  useEffect(() => {
    // The access/refresh tokens live in httpOnly cookies, invisible to JS —
    // so the only way to know if a session exists is to ask the server.
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function login(user: User) {
    setUser(user);
  }

  function logout() {
    authApi.logout().finally(() => {
      setUser(null);
      navigate("/login");
    });
  }

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
