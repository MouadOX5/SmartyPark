import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { AppState } from 'react-native';
import { notificationApi } from '../api/notificationApi';
import { NotificationResponse } from '../types';
import { useAuth } from './AuthContext';

const POLL_INTERVAL_MS = 30000;

interface NotificationContextType {
  notifications: NotificationResponse[];
  unreadCount: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setIsLoading(true);
      const data = await notificationApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.estLue).length);
    } catch (e) {
      console.warn('Erreur chargement notifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, estLue: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('Erreur marquage notification lue:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, estLue: true })));
      setUnreadCount(0);
    } catch (e) {
      console.warn('Erreur marquage notifications lues:', e);
    }
  };

  useEffect(() => {
    refresh();

    if (isAuthenticated) {
      intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isAuthenticated) {
        refresh();
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      subscription.remove();
    };
  }, [isAuthenticated, refresh]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, refresh, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé au sein d\'un NotificationProvider');
  }
  return context;
};
