import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    try {
      setIsLoading(true);
      setNotifications(await notificationApi.getAll());
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
    } catch (e) {
      console.warn('Erreur marquage notification lue:', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, estLue: true })));
    } catch (e) {
      console.warn('Erreur marquage notifications lues:', e);
    }
  };

  useEffect(() => {
    refresh();
    if (!isAuthenticated) return;
    const interval = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  const unreadCount = notifications.filter((n) => !n.estLue).length;

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
