/**
 * Formate une distance en mètres sous forme lisible (ex: "800 m" ou "1.2 km")
 */
export function formatDistance(metres: number): string {
  if (metres < 1000) {
    return `${Math.round(metres)} m`;
  }
  return `${(metres / 1000).toFixed(1)} km`;
}

/**
 * Formate un nombre de secondes en format chronomètre "HH:MM:SS" ou "MM:SS"
 */
export function formatTimerSeconds(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

/**
 * Formate une date ISO sous forme "23/08/2026 14:30"
 */
export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return isoString;
  }
}

/**
 * Traduit et formate la catégorie pour affichage UI
 */
export function formatCategoryName(category: string): string {
  switch (category) {
    case 'STREET_WORKOUT':
      return 'Street Workout';
    case 'FOOTBALL':
      return 'Football';
    case 'BASKETBALL':
      return 'Basketball';
    case 'ENFANTS':
      return 'Aires de jeux';
    default:
      return category;
  }
}

/**
 * Traduit le statut de signalement
 */
export function formatSignalementStatus(statut: string): { label: string; color: string } {
  switch (statut) {
    case 'EN_ATTENTE':
      return { label: 'En attente', color: '#F59E0B' };
    case 'TRAITE':
      return { label: 'Traité', color: '#10B981' };
    case 'REJETE':
      return { label: 'Rejeté', color: '#EF4444' };
    default:
      return { label: statut, color: '#94A3B8' };
  }
}

/**
 * Traduit le statut de proposition
 */
export function formatPropositionStatus(statut: string): { label: string; color: string } {
  switch (statut) {
    case 'EN_ATTENTE':
      return { label: 'En attente', color: '#F59E0B' };
    case 'VALIDEE':
      return { label: 'Validée', color: '#10B981' };
    case 'REJETEE':
      return { label: 'Refusée', color: '#EF4444' };
    default:
      return { label: statut, color: '#94A3B8' };
  }
}
