import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../api/client';
import { LoginRequest, UtilisateurResponse } from '../types';

interface AuthContextType {
  user: UtilisateurResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UtilisateurResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    const token = tokenStorage.get();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const profile = await authApi.getMe();
      setUser(profile);
    } catch {
      tokenStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const token = await authApi.login(data);
    tokenStorage.set(token);
    const profile = await authApi.getMe();

    // Ce dashboard est réservé aux modérateurs/administrateurs : un compte
    // MOBILE_USER valide mais sans droit d'accès est refusé ici même si
    // ses identifiants sont corrects.
    if (profile.role !== 'MODERATEUR' && profile.role !== 'ADMINISTRATEUR') {
      tokenStorage.clear();
      throw new Error("Ce compte n'a pas accès au dashboard d'administration.");
    }

    setUser(profile);
  };

  const logout = () => {
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
};
