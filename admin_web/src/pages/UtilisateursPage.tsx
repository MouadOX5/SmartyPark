import React, { useState, useEffect, useCallback } from 'react';
import { Users } from 'lucide-react';
import { utilisateurApi } from '../api/utilisateurApi';
import { extractErrorMessage } from '../api/client';
import { formatDateTime } from '../utils/formatters';
import { Role, UtilisateurResponse } from '../types';

const ROLE_LABELS: Record<Role, string> = {
  MOBILE_USER: 'Utilisateur',
  MODERATEUR: 'Modérateur',
  ADMINISTRATEUR: 'Administrateur',
};

const ROLE_BADGE: Record<Role, string> = {
  MOBILE_USER: 'badge-info',
  MODERATEUR: 'badge-warning',
  ADMINISTRATEUR: 'badge-danger',
};

export function UtilisateursPage() {
  const [utilisateurs, setUtilisateurs] = useState<UtilisateurResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setUtilisateurs(await utilisateurApi.getAll());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (item: UtilisateurResponse) => {
    setTogglingId(item.id);
    try {
      const updated = await utilisateurApi.toggleActif(item.id);
      setUtilisateurs((prev) => prev.map((u) => (u.id === item.id ? updated : u)));
    } catch (e) {
      alert(extractErrorMessage(e, 'Impossible de modifier ce compte.'));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Utilisateurs</h1>
        <p className="page-subtitle">Gestion des comptes — activer/désactiver l'accès</p>
      </div>
      <div className="page-body">
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : utilisateurs.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <div className="empty-state-title">Aucun utilisateur</div>
          </div>
        ) : (
          <div className="card table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Rôle</th>
                  <th>Inscrit le</th>
                  <th>Statut</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map((u) => (
                  <tr key={u.id}>
                    <td>{u.prenom} {u.nom}</td>
                    <td>{u.email}</td>
                    <td>{u.telephone || '—'}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role]}`}>{ROLE_LABELS[u.role]}</span></td>
                    <td>{formatDateTime(u.dateInscription)}</td>
                    <td>
                      <span className={`badge ${u.estActif ? 'badge-success' : 'badge-neutral'}`}>
                        {u.estActif ? 'Actif' : 'Désactivé'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.estActif ? 'btn-danger' : 'btn-primary'}`}
                        disabled={togglingId === u.id}
                        onClick={() => handleToggle(u)}
                      >
                        {togglingId === u.id ? '...' : u.estActif ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
