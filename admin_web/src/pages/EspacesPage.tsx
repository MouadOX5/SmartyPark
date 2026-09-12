import React, { useState, useEffect, useCallback } from 'react';
import { MapPinned, MapPin, Check, Trash2, Plus, Pencil, X } from 'lucide-react';
import { espacePublicApi } from '../api/espacePublicApi';
import { extractErrorMessage } from '../api/client';
import { formatCategoryName } from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';
import { useAuth } from '../context/AuthContext';
import { CategorieEspace, EspacePublicResponse } from '../types';

const CATEGORIES: { key: CategorieEspace; label: string }[] = [
  { key: 'STREET_WORKOUT', label: 'Street Workout' },
  { key: 'FOOTBALL', label: 'Football' },
  { key: 'BASKETBALL', label: 'Basketball' },
  { key: 'ENFANTS', label: 'Aires de jeux' },
];

export function EspacesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMINISTRATEUR';

  const [espaces, setEspaces] = useState<EspacePublicResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCible, setEditCible] = useState<EspacePublicResponse | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setEspaces(await espacePublicApi.getAllTous());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleValider = async (item: EspacePublicResponse) => {
    try {
      const updated = await espacePublicApi.valider(item.id);
      setEspaces((prev) => prev.map((e) => (e.id === item.id ? updated : e)));
    } catch (e) {
      alert(extractErrorMessage(e, "Impossible de publier l'espace."));
    }
  };

  const handleSupprimer = async (item: EspacePublicResponse) => {
    if (!confirm(`Supprimer définitivement "${item.nom}" ?`)) return;
    try {
      await espacePublicApi.supprimer(item.id);
      setEspaces((prev) => prev.filter((e) => e.id !== item.id));
    } catch (e) {
      alert(extractErrorMessage(e, 'Impossible de supprimer cet espace.'));
    }
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Espaces publics</h1>
          <p className="page-subtitle">Tous les espaces, publiés ou non</p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Créer un espace
        </button>
      </div>
      <div className="page-body">
        {isLoading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : espaces.length === 0 ? (
          <div className="empty-state">
            <MapPinned size={40} />
            <div className="empty-state-title">Aucun espace public</div>
          </div>
        ) : (
          <div className="grid grid-cols-3">
            {espaces.map((item) => (
              <div className="card" key={item.id} style={{ overflow: 'hidden' }}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.nom} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                )}
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <CategoryIcon categorie={item.categorie} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.nom}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatCategoryName(item.categorie)}</div>
                      </div>
                    </div>
                    <span className={`badge ${item.estValide ? 'badge-success' : 'badge-warning'}`}>
                      {item.estValide ? 'Publié' : 'Non publié'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
                    <MapPin size={14} /> {item.adresse}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setEditCible(item)}>
                      <Pencil size={15} /> Modifier
                    </button>
                    {isAdmin && (
                      <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleSupprimer(item)}>
                        <Trash2 size={15} /> Supprimer
                      </button>
                    )}
                    {!item.estValide && (
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleValider(item)}>
                        <Check size={15} /> Publier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {createOpen && (
        <EspaceFormModal
          onClose={() => setCreateOpen(false)}
          onSaved={(created) => { setEspaces((prev) => [created, ...prev]); setCreateOpen(false); }}
        />
      )}

      {editCible && (
        <EspaceFormModal
          espace={editCible}
          onClose={() => setEditCible(null)}
          onSaved={(updated) => { setEspaces((prev) => prev.map((e) => (e.id === updated.id ? updated : e))); setEditCible(null); }}
        />
      )}
    </>
  );
}

/**
 * Formulaire de création OU modification d'un espace public, selon que la
 * prop `espace` est fournie. En création, l'espace est automatiquement
 * publié une fois créé (comportement déjà en place) ; en modification, le
 * statut publié/non-publié existant est conservé (voir EspacePublicController.update).
 */
function EspaceFormModal({
  espace,
  onClose,
  onSaved,
}: {
  espace?: EspacePublicResponse;
  onClose: () => void;
  onSaved: (e: EspacePublicResponse) => void;
}) {
  const isEdit = !!espace;
  const [nom, setNom] = useState(espace?.nom || '');
  const [description, setDescription] = useState(espace?.description || '');
  const [categorie, setCategorie] = useState<CategorieEspace | ''>(espace?.categorie || '');
  const [adresse, setAdresse] = useState(espace?.adresse || '');
  const [latitude, setLatitude] = useState(espace ? String(espace.latitude) : '');
  const [longitude, setLongitude] = useState(espace ? String(espace.longitude) : '');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    if (!nom.trim() || !categorie || !adresse.trim() || isNaN(lat) || isNaN(lon)) {
      setError('Nom, catégorie, adresse, latitude et longitude sont obligatoires.');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = { nom: nom.trim(), description: description.trim(), categorie, adresse: adresse.trim(), latitude: lat, longitude: lon };
      if (isEdit) {
        const updated = await espacePublicApi.update(espace.id, payload, image);
        onSaved(updated);
      } else {
        const created = await espacePublicApi.creer(payload, image);
        const validated = await espacePublicApi.valider(created.id);
        onSaved(validated);
      }
    } catch (e) {
      setError(extractErrorMessage(e, `Impossible de ${isEdit ? 'modifier' : 'créer'} l'espace.`));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="modal-title">{isEdit ? `Modifier "${espace!.nom}"` : 'Créer un espace public'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="field">
          <label>Nom *</label>
          <input className="input" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Terrain de foot Agdal" />
        </div>

        <div className="field">
          <label>Catégorie *</label>
          <select className="select" value={categorie} onChange={(e) => setCategorie(e.target.value as CategorieEspace)}>
            <option value="">Choisir...</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        <div className="field">
          <label>Adresse *</label>
          <input className="input" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Ex : Avenue Ibn Sina, Rabat" />
        </div>

        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className="field" style={{ flex: 1 }}>
            <label>Latitude *</label>
            <input className="input" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="33.5731" />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Longitude *</label>
            <input className="input" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-7.5898" />
          </div>
        </div>

        <div className="field">
          <label>{isEdit ? 'Remplacer la photo' : 'Photo'}</label>
          {isEdit && espace!.imageUrl && !image && (
            <img src={espace!.imageUrl} alt={espace!.nom} style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: 8 }} />
          )}
          <input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setImage(e.target.files?.[0] || null)} />
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" disabled={isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer et publier'}
          </button>
        </div>
      </div>
    </div>
  );
}
