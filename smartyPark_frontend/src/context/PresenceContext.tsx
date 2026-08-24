import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { presenceApi } from '../api/presenceApi';
import { PresenceResponse } from '../types';
import { useAuth } from './AuthContext';

interface PresenceContextType {
  activePresence: PresenceResponse | null;
  isActive: boolean;
  durationSeconds: number;
  isLoading: boolean;
  startPresence: (espacePublicId: number) => Promise<PresenceResponse>;
  endPresence: () => Promise<PresenceResponse>;
  refreshPresence: () => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [activePresence, setActivePresence] = useState<PresenceResponse | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshPresence = async () => {
    if (!isAuthenticated) {
      setActivePresence(null);
      setDurationSeconds(0);
      return;
    }

    try {
      setIsLoading(true);
      const hasActive = await presenceApi.hasActive();
      if (hasActive) {
        const presence = await presenceApi.getActive();
        setActivePresence(presence);
      } else {
        setActivePresence(null);
        setDurationSeconds(0);
      }
    } catch (e) {
      console.warn('Erreur vérification présence active:', e);
      setActivePresence(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPresence();
  }, [isAuthenticated]);

  // Horloge / chronomètre dynamique
  useEffect(() => {
    let interval: any = null;

    if (activePresence && activePresence.heureArrivee) {
      const startTime = new Date(activePresence.heureArrivee).getTime();

      const updateTimer = () => {
        const now = Date.now();
        const diffInSeconds = Math.max(0, Math.floor((now - startTime) / 1000));
        setDurationSeconds(diffInSeconds);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setDurationSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activePresence]);

  const startPresence = async (espacePublicId: number): Promise<PresenceResponse> => {
    setIsLoading(true);
    try {
      const response = await presenceApi.demarrer({ espacePublicId });
      setActivePresence(response);
      return response;
    } catch (error) {
      console.error('Erreur démarrage présence:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const endPresence = async (): Promise<PresenceResponse> => {
    setIsLoading(true);
    try {
      const response = await presenceApi.terminer();
      setActivePresence(null);
      setDurationSeconds(0);
      return response;
    } catch (error) {
      console.error('Erreur clôture présence:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PresenceContext.Provider
      value={{
        activePresence,
        isActive: !!activePresence,
        durationSeconds,
        isLoading,
        startPresence,
        endPresence,
        refreshPresence,
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
};

export const usePresence = () => {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence doit être utilisé au sein d\'un PresenceProvider');
  }
  return context;
};
