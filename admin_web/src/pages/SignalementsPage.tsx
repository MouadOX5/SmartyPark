import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Sparkles, Wrench, HelpCircle, User, Clock, Check, X } from 'lucide-react';
import { signalementApi } from '../api/signalementApi';
import { extractErrorMessage } from '../api/client';
import { formatDateTime } from '../utils/formatters';
import { SignalementResponse, StatutSignalement, TypeSignalement } from '../types';

const TYPE_CONFIG: Record<TypeSignalement, { label: string; icon: React.ReactNode; color: string }> = {
  PROPRETE: { label: 'Propreté', icon: <Sparkles size={16} />, color: '#0d9488' },
  EQUIPEMENT: { label: 'Équipement', icon: <Wrench size={16} />, color: '#d97706' },
  SECURITE: { label: 'Sécurité', icon: <ShieldAlert size={16} />, color: '#dc2626' },
  AUTRE: { label: 'Autre', icon: <HelpCircle size={16} />, color: '#6366f1' },
};

function SignalementPhoto({ id }: { id: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    signalementApi.getPhotoObjectUrl(id)
      .then((u) => { if (!cancelled) { objectUrl = u; setUrl(u); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (failed) return <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Photo indisponible</div>;
  if (!url) return <div className="spinner" style={{ width: 18, height: 18 }} />;
  return <img src={url} alt="Signalement" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10, marginBottom: 10 }} />;
}

export function SignalementsPage() {
  const [signalements, setSignalements] = useState<SignalementResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [traiterCible, setTraiterCible] = useState<{ item: SignalementResponse; statut: StatutSignalement } | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setSignalements(await signalementApi.getEnAttente());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitTraiter = async () => {
    if (!traiterCible || !commentaire.trim()) return;
    setIsSubmitting(true);
    try {
      await signalementApi.traiter(traiterCible.item.id, traiterCible.statut, commentaire.trim());
      setSignalements((prev) => prev.filter((s) => s.id !== traiterCible.item.id));
      setTraiterCible(null);
      setCommentaire('');
    } catch (e) {
      alert(extractErrorMessage(e, 'Impossible de traiter le signalement.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Signalements</h1>
        <p className="page-subtitle">Problèmes signalés par les utilisateurs, en attente de traitement</p>
      </div>
      <div className="page-body">
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : signalements.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert size={40} />
            <div className="empty-state-title">Aucun signalement en attente</div>
            <div>Tout est à jour.</div>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {signalements.map((item) => {
              const cfg = TYPE_CONFIG[item.type];
              return (
                <div className="card" key={item.id} style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 18, background: cfg.color + '1A', color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{cfg.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.espacePublicNom}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{item.description}</p>

                  {item.photoDisponible && <SignalementPhoto id={item.id} />}

                  <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <User size={14} /> Signalé par {item.signaleParkPrenom} {item.signaleParkNom}
                  </div>
                  <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <Clock size={14} /> {formatDateTime(item.dateCreation)}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => setTraiterCible({ item, statut: 'REJETE' })}>
                      <X size={15} /> Rejeter
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setTraiterCible({ item, statut: 'TRAITE' })}>
                      <Check size={15} /> Marquer traité
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {traiterCible && (
        <div className="modal-overlay" onClick={() => setTraiterCible(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {traiterCible.statut === 'TRAITE' ? 'Marquer comme traité' : 'Rejeter le signalement'}
            </h3>
            <div className="field">
              <label>Commentaire modérateur *</label>
              <textarea
                className="textarea"
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Expliquez l'action prise ou la raison du rejet..."
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setTraiterCible(null); setCommentaire(''); }}>Annuler</button>
              <button className="btn btn-primary" disabled={!commentaire.trim() || isSubmitting} onClick={submitTraiter}>
                {isSubmitting ? 'Envoi...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
