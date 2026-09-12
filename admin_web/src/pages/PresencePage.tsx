import React, { useState, useEffect, useCallback } from 'react';
import { Users, Clock, MapPin, History, Radio, LogOut, Navigation } from 'lucide-react';
import { espacePublicApi } from '../api/espacePublicApi';
import { presenceApi } from '../api/presenceApi';
import { formatDateTime, formatDuration, MOTIF_LABELS } from '../utils/formatters';
import { EspacePublicResponse, PresenceResponse } from '../types';

type Tab = 'actives' | 'historique';

const MOTIF_BADGE: Record<string, string> = {
  TERMINAISON_VOLONTAIRE: 'badge-success',
  SORTIE_DE_ZONE: 'badge-warning',
  EXPIRATION_AUTOMATIQUE: 'badge-neutral',
};

export function PresencePage() {
  const [espaces, setEspaces] = useState<EspacePublicResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');
  const [tab, setTab] = useState<Tab>('actives');

  const [actives, setActives] = useState<PresenceResponse[]>([]);
  const [historique, setHistorique] = useState<PresenceResponse[]>([]);
  const [isLoadingEspaces, setIsLoadingEspaces] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadEspaces = useCallback(async () => {
    setIsLoadingEspaces(true);
    try {
      const data = await espacePublicApi.getAllTous();
      setEspaces(data);
      if (data.length > 0) setSelectedId((prev) => (prev === '' ? data[0].id : prev));
    } finally {
      setIsLoadingEspaces(false);
    }
  }, []);

  useEffect(() => { loadEspaces(); }, [loadEspaces]);

  const loadData = useCallback(async (espaceId: number) => {
    setIsLoadingData(true);
    try {
      const [activesData, historiqueData] = await Promise.all([
        presenceApi.getActiveByEspace(espaceId),
        presenceApi.getHistoriqueByEspace(espaceId),
      ]);
      setActives(activesData);
      setHistorique(historiqueData);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (selectedId !== '') loadData(selectedId);
  }, [selectedId, loadData]);

  const selectedEspace = espaces.find((e) => e.id === selectedId);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Supervision présence</h1>
        <p className="page-subtitle">Qui est présent en temps réel, et l'historique des passages, par espace</p>
      </div>
      <div className="page-body">
        {isLoadingEspaces ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : espaces.length === 0 ? (
          <div className="empty-state">
            <MapPin size={40} />
            <div className="empty-state-title">Aucun espace public</div>
          </div>
        ) : (
          <>
            {/* Sélecteur d'espace en menu déroulant */}
            <div className="field" style={{ maxWidth: 360 }}>
              <label>Espace public</label>
              <select
                className="select"
                value={selectedId}
                onChange={(e) => setSelectedId(Number(e.target.value))}
              >
                {espaces.map((e) => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginBottom: 20 }}>
              <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Radio size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{isLoadingData ? '...' : actives.length}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Présences actives</div>
                </div>
              </div>
              <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <History size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{isLoadingData ? '...' : historique.length}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Passages au total</div>
                </div>
              </div>
              {selectedEspace && (
                <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 20, background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={18} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedEspace.adresse}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Adresse</div>
                  </div>
                </div>
              )}
            </div>

            {/* Onglets Actives / Historique */}
            <div className="segmented" style={{ marginBottom: 16 }}>
              <button className={tab === 'actives' ? 'active' : ''} onClick={() => setTab('actives')}>
                Présences actives {actives.length > 0 ? `(${actives.length})` : ''}
              </button>
              <button className={tab === 'historique' ? 'active' : ''} onClick={() => setTab('historique')}>
                Historique {historique.length > 0 ? `(${historique.length})` : ''}
              </button>
            </div>

            {isLoadingData ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : tab === 'actives' ? (
              actives.length === 0 ? (
                <div className="empty-state">
                  <Users size={40} />
                  <div className="empty-state-title">Aucune présence active</div>
                  <div>Personne n'est actuellement présent ici.</div>
                </div>
              ) : (
                <div className="card table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Utilisateur</th>
                        <th>Arrivée</th>
                        <th>Durée en cours</th>
                        <th>Distance déclarée</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actives.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600 }}>{p.utilisateurPrenom || 'Utilisateur'} {p.utilisateurNom || ''}</td>
                          <td><Clock size={13} style={{ verticalAlign: -2, marginRight: 4 }} />{formatDateTime(p.heureArrivee)}</td>
                          <td><span className="badge badge-success">{formatDuration(p.heureArrivee)}</span></td>
                          <td>
                            {p.distanceDeclarationMetres !== undefined ? (
                              <><Navigation size={13} style={{ verticalAlign: -2, marginRight: 4 }} />{Math.round(p.distanceDeclarationMetres)} m</>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : historique.length === 0 ? (
              <div className="empty-state">
                <History size={40} />
                <div className="empty-state-title">Aucun historique</div>
                <div>Aucune présence n'a encore eu lieu dans cet espace.</div>
              </div>
            ) : (
              <div className="card table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>Arrivée</th>
                      <th>Départ</th>
                      <th>Durée</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historique.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600 }}>{p.utilisateurPrenom || 'Utilisateur'} {p.utilisateurNom || ''}</td>
                        <td>{formatDateTime(p.heureArrivee)}</td>
                        <td>
                          {p.heureDepart ? formatDateTime(p.heureDepart) : (
                            <span className="badge badge-success"><Radio size={11} /> En cours</span>
                          )}
                        </td>
                        <td>{formatDuration(p.heureArrivee, p.heureDepart)}</td>
                        <td>
                          {p.motifTerminaison ? (
                            <span className={`badge ${MOTIF_BADGE[p.motifTerminaison] || 'badge-neutral'}`}>
                              <LogOut size={11} /> {MOTIF_LABELS[p.motifTerminaison] || p.motifTerminaison}
                            </span>
                          ) : (
                            <span className="badge badge-success"><Radio size={11} /> Active</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
