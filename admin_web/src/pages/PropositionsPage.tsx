import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, History, MapPin, User, Clock, Check, X } from 'lucide-react';
import { propositionApi } from '../api/propositionApi';
import { extractErrorMessage } from '../api/client';
import { formatDateTime, formatCategoryName } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';
import { PropositionEspaceResponse, StatutProposition } from '../types';

type Tab = 'en-attente' | 'historique';

const STATUT_BADGE: Record<StatutProposition, string> = {
  EN_ATTENTE: 'badge-warning',
  VALIDEE: 'badge-success',
  REJETEE: 'badge-danger',
};

const STATUT_LABELS: Record<StatutProposition, string> = {
  EN_ATTENTE: 'En attente',
  VALIDEE: 'Validée',
  REJETEE: 'Refusée',
};

export function PropositionsPage() {
  const [tab, setTab] = useState<Tab>('en-attente');
  const [enAttente, setEnAttente] = useState<PropositionEspaceResponse[]>([]);
  const [historique, setHistorique] = useState<PropositionEspaceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refusCible, setRefusCible] = useState<PropositionEspaceResponse | null>(null);
  const [motifRefus, setMotifRefus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [enAttenteData, historiqueData] = await Promise.all([
        propositionApi.getEnAttente(),
        propositionApi.getHistorique(),
      ]);
      setEnAttente(enAttenteData);
      setHistorique(historiqueData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValider = async (item: PropositionEspaceResponse) => {
    if (!confirm(`Valider "${item.nom}" ? Elle deviendra un espace public visible par tous.`)) return;
    try {
      const updated = await propositionApi.valider(item.id);
      setEnAttente((prev) => prev.filter((p) => p.id !== item.id));
      setHistorique((prev) => [updated, ...prev]);
    } catch (e) {
      alert(extractErrorMessage(e, 'Impossible de valider la proposition.'));
    }
  };

  const submitRefus = async () => {
    if (!refusCible || !motifRefus.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await propositionApi.refuser(refusCible.id, motifRefus.trim());
      setEnAttente((prev) => prev.filter((p) => p.id !== refusCible.id));
      setHistorique((prev) => [updated, ...prev]);
      setRefusCible(null);
      setMotifRefus('');
    } catch (e) {
      alert(extractErrorMessage(e, 'Impossible de refuser la proposition.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const list = tab === 'en-attente' ? enAttente : historique;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Propositions</h1>
        <p className="page-subtitle">Espaces proposés par les utilisateurs</p>
      </div>
      <div className="page-body">
        <div className="segmented" style={{ marginBottom: 20 }}>
          <button className={tab === 'en-attente' ? 'active' : ''} onClick={() => setTab('en-attente')}>
            En attente {enAttente.length > 0 ? `(${enAttente.length})` : ''}
          </button>
          <button className={tab === 'historique' ? 'active' : ''} onClick={() => setTab('historique')}>
            Historique {historique.length > 0 ? `(${historique.length})` : ''}
          </button>
        </div>

        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            {tab === 'en-attente' ? <ClipboardList size={40} /> : <History size={40} />}
            <div className="empty-state-title">
              {tab === 'en-attente' ? 'Aucune proposition en attente' : 'Aucun historique'}
            </div>
            <div>{tab === 'en-attente' ? 'Tout est à jour.' : "Aucune proposition n'a encore été traitée."}</div>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {list.map((item) => (
              <div className="card" key={item.id} style={{ overflow: 'hidden' }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.nom} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CategoryIcon categorie={item.categorie} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.nom}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatCategoryName(item.categorie)}</div>
                      </div>
                    </div>
                    {tab === 'historique' && (
                      <span className={`badge ${STATUT_BADGE[item.statut]}`}>{STATUT_LABELS[item.statut]}</span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <MapPin size={14} /> {item.adresse}
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <User size={14} /> Proposé par {item.proposeParkPrenom} {item.proposeParkNom}
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
                    <Clock size={14} /> {formatDateTime(item.dateProposition)}
                  </div>
                  {item.description && (
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>{item.description}</p>
                  )}

                  {item.statut === 'REJETEE' && item.motifRefus && (
                    <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', borderRadius: 8, padding: '8px 10px', fontSize: 12, marginBottom: 12 }}>
                      <strong>Motif du refus :</strong> {item.motifRefus}
                    </div>
                  )}

                  {tab === 'en-attente' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setRefusCible(item)}>
                        <X size={15} /> Refuser
                      </button>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleValider(item)}>
                        <Check size={15} /> Valider
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {refusCible && (
        <div className="modal-overlay" onClick={() => setRefusCible(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Refuser "{refusCible.nom}"</h3>
            <div className="field">
              <label>Motif du refus *</label>
              <textarea
                className="textarea"
                value={motifRefus}
                onChange={(e) => setMotifRefus(e.target.value)}
                placeholder="Expliquez pourquoi cette proposition est refusée..."
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setRefusCible(null); setMotifRefus(''); }}>Annuler</button>
              <button className="btn btn-primary" disabled={!motifRefus.trim() || isSubmitting} onClick={submitRefus}>
                {isSubmitting ? 'Envoi...' : 'Confirmer le refus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
