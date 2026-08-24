import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { storage } from '../utils/storage';
import { LoginRequest, RegisterRequest, UtilisateurResponse } from '../types';

interface AuthContextType {
  user: UtilisateurResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UtilisateurResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const savedToken = await storage.getToken();
      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await authApi.getMe();
          setUser(profile);
          await storage.saveUserData(JSON.stringify(profile));
        } catch (error) {
          console.warn('Erreur de validation du token:', error);
          await storage.clearAll();
          setToken(null);
          setUser(null);
        }
      }
    } catch (e) {
      console.warn('Erreur vérification authentification:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const jwtToken = await authApi.login(data);
      await storage.saveToken(jwtToken);
      setToken(jwtToken);

      const profile = await authApi.getMe();
      setUser(profile);
      await storage.saveUserData(JSON.stringify(profile));
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      await authApi.register(data);
      // Après inscription réussie, on connecte directement l'utilisateur
      await login({ email: data.email, password: data.password });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await storage.clearAll();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      await storage.saveUserData(JSON.stringify(profile));
    } catch (e) {
      console.warn('Erreur rafraîchissement profil:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
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
