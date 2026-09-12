import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute, AdminOnlyRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { PropositionsPage } from './pages/PropositionsPage';
import { SignalementsPage } from './pages/SignalementsPage';
import { EspacesPage } from './pages/EspacesPage';
import { PresencePage } from './pages/PresencePage';
import { UtilisateursPage } from './pages/UtilisateursPage';
import { JournalPage } from './pages/JournalPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/propositions" element={<PropositionsPage />} />
              <Route path="/signalements" element={<SignalementsPage />} />
              <Route path="/espaces" element={<EspacesPage />} />
              <Route path="/presence" element={<PresencePage />} />
              <Route
                path="/utilisateurs"
                element={
                  <AdminOnlyRoute>
                    <UtilisateursPage />
                  </AdminOnlyRoute>
                }
              />
              <Route
                path="/journal"
                element={
                  <AdminOnlyRoute>
                    <JournalPage />
                  </AdminOnlyRoute>
                }
              />
            </Route>

            <Route path="/" element={<Navigate to="/propositions" replace />} />
            <Route path="*" element={<Navigate to="/propositions" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
