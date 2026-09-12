import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ClipboardList,
  ShieldAlert,
  MapPinned,
  Users,
  Activity,
  ScrollText,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Topbar } from './Topbar';

export function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMINISTRATEUR';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <ShieldCheck size={22} />
          SmartyPark Admin
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/propositions" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <ClipboardList size={18} />
            Propositions
          </NavLink>
          <NavLink to="/signalements" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <ShieldAlert size={18} />
            Signalements
          </NavLink>
          <NavLink to="/espaces" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <MapPinned size={18} />
            Espaces publics
          </NavLink>
          <NavLink to="/presence" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
            <Activity size={18} />
            Supervision présence
          </NavLink>
          {isAdmin && (
            <NavLink to="/utilisateurs" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <Users size={18} />
              Utilisateurs
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/journal" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <ScrollText size={18} />
              Journal d'activité
            </NavLink>
          )}
        </nav>
      </aside>

      <div className="main-content">
        <Topbar />
        <Outlet />
      </div>
    </div>
  );
}
