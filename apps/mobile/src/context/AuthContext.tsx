import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiLogin, apiRegister, apiRefresh, apiLogout, apiMe, User } from '../services/api';

type Ctx = {
  user: User | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const refreshUser = async () => {
    try {
      const token = await SecureStore.getItemAsync(K.access);
      if (!token) return;
      const me = await apiMe(token);
      const next = { id: me.id, username: me.username, email: me.email, isVerified: me.isVerified };
      await SecureStore.setItemAsync(K.user, JSON.stringify(next));
      setUser(next);
    } catch {}
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
