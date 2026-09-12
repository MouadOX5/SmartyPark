import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  PartyPopper,
  XCircle,
  Wrench,
  ShieldCheck,
  ClipboardList,
  ShieldAlert,
  CheckCheck,
  BellOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { TypeNotification } from '../types';

const ROLE_LABELS: Record<string, string> = {
  MODERATEUR: 'Modérateur',
  ADMINISTRATEUR: 'Administrateur',
};

const TYPE_CONFIG: Record<TypeNotification, { icon: React.ReactNode; color: string; bg: string }> = {
  PROPOSITION_VALIDEE: { icon: <PartyPopper size={16} />, color: '#16a34a', bg: '#dcfce7' },
  PROPOSITION_REJETEE: { icon: <XCircle size={16} />, color: '#dc2626', bg: '#fee2e2' },
  SIGNALEMENT_TRAITE: { icon: <Wrench size={16} />, color: '#0284c7', bg: '#e0f2fe' },
  SIGNALEMENT_REJETE: { icon: <ShieldCheck size={16} />, color: '#d97706', bg: '#fef3c7' },
  NOUVELLE_PROPOSITION: { icon: <ClipboardList size={16} />, color: '#7c3aed', bg: '#ede9fe' },
  NOUVEAU_SIGNALEMENT: { icon: <ShieldAlert size={16} />, color: '#dc2626', bg: '#fee2e2' },
};

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function Topbar({ title }: { title?: string }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>

      <div className="topbar-actions">
        <div className="dropdown-wrap" ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen((v) => !v)}>
            <Bell size={19} />
            {unreadCount > 0 && <span className="icon-btn-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="dropdown-panel notif-panel">
              <div className="notif-panel-header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={markAllAsRead}>
                    <CheckCheck size={14} /> Tout marquer lu
                  </button>
                )}
              </div>
              <div className="notif-panel-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <BellOff size={28} />
                    <span>Aucune notification</span>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const cfg = TYPE_CONFIG[n.type];
                    return (
                      <div
                        key={n.id}
                        className={`notif-item${n.estLue ? '' : ' unread'}`}
                        onClick={() => !n.estLue && markAsRead(n.id)}
                      >
                        <div className="notif-item-icon" style={{ background: cfg.bg, color: cfg.color }}>
                          {cfg.icon}
                        </div>
                        <div className="notif-item-body">
                          <div className="notif-item-title">{n.titre}</div>
                          <div className="notif-item-message">{n.message}</div>
                          <div className="notif-item-date">{formatRelative(n.dateCreation)}</div>
                        </div>
                        {!n.estLue && <div className="notif-dot" />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dropdown-wrap" ref={accountRef}>
          <button className="account-btn" onClick={() => setAccountOpen((v) => !v)}>
            <div className="account-avatar">{user?.prenom?.[0]?.toUpperCase() || '?'}</div>
            <span className="account-name">{user?.prenom}</span>
            <ChevronDown size={15} />
          </button>

          {accountOpen && (
            <div className="dropdown-panel account-panel">
              <div className="account-panel-header">
                <div className="account-avatar" style={{ width: 40, height: 40 }}>{user?.prenom?.[0]?.toUpperCase() || '?'}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{user?.prenom} {user?.nom}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user ? ROLE_LABELS[user.role] : ''}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 14px', borderTop: '1px solid var(--border)' }}>
                {user?.email}
              </div>
              <button className="account-panel-logout" onClick={handleLogout}>
                <LogOut size={15} /> Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
