import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiLogin, apiRegister, apiRefresh, apiLogout, User } from '../services/api';

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthContext);

const K = { access: 'lc_access', refresh: 'lc_refresh', user: 'lc_user' };

async function clearStore() {
  await SecureStore.deleteItemAsync(K.access);
  await SecureStore.deleteItemAsync(K.refresh);
  await SecureStore.deleteItemAsync(K.user);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const refresh = await SecureStore.getItemAsync(K.refresh);
        const stored = await SecureStore.getItemAsync(K.user);
        if (refresh && stored) {
          const t = await apiRefresh(refresh);
          await SecureStore.setItemAsync(K.access, t.accessToken);
          await SecureStore.setItemAsync(K.refresh, t.refreshToken);
          setUser(JSON.parse(stored));
        }
      } catch {
        await clearStore();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (identifier: string, password: string) => {
    const r = await apiLogin(identifier, password);
    await SecureStore.setItemAsync(K.access, r.accessToken);
    await SecureStore.setItemAsync(K.refresh, r.refreshToken);
    await SecureStore.setItemAsync(K.user, JSON.stringify(r.user));
    setUser(r.user);
  };

  const register = async (username: string, email: string, password: string) => {
    await apiRegister({ username, email, password });
    await login(username, password);
  };

  const logout = async () => {
    try {
      const refresh = await SecureStore.getItemAsync(K.refresh);
      if (refresh) await apiLogout(refresh);
    } catch {}
    await clearStore();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
