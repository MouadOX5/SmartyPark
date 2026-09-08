// ============================================================================
// File: PresenceContext.tsx
// ============================================================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { presenceApi } from '../api/presenceApi';
import { PresenceRequest, PresenceResponse } from '../types';
import { useAuth } from './AuthContext';

interface PresenceContextType {
  activePresence: PresenceResponse | null;
  isActive: boolean;
  durationSeconds: number;
  isLoading: boolean;
  /** Démarre une présence avec espacePublicId + coords GPS */
  startPresence: (payload: PresenceRequest) => Promise<PresenceResponse>;
  /** Termine la présence active */
  endPresence: () => Promise<PresenceResponse>;
  /** Rafraîchit l'état de la présence active */
  refreshPresence: () => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const [activePresence, setActivePresence] = useState<PresenceResponse | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshPresence = async () => {
    // La présence est une fonctionnalité réservée aux comptes MOBILE_USER côté backend
    // (voir PresenceController.java) : les modérateurs/admins reçoivent un 403.
    if (!isAuthenticated || user?.role !== 'MOBILE_USER') {
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
      console.warn('Erreur verification presence active:', e);
      setActivePresence(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshPresence();
  }, [isAuthenticated, user?.role]);

  // Horloge / chronometre dynamique
  useEffect(() => {
    let interval: any = null;

    if (activePresence?.heureArrivee && activePresence.statut === 'ACTIVE') {
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

  /**
   * Démarre une présence dans un espace public.
   * @param payload { espacePublicId, latitude, longitude }
   */
  const startPresence = async (payload: PresenceRequest): Promise<PresenceResponse> => {
    setIsLoading(true);
    try {
      const response = await presenceApi.demarrer(payload);
      setActivePresence(response);
      return response;
    } catch (error) {
      console.error('Erreur demarrage presence:', error);
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
      console.error('Erreur cloture presence:', error);
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
    throw new Error("usePresence doit etre utilise au sein d'un PresenceProvider");
  }
  return context;
};