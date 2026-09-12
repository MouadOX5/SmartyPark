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

export function formatCategoryName(category: string): string {
  switch (category) {
    case 'STREET_WORKOUT': return 'Street Workout';
    case 'FOOTBALL': return 'Football';
    case 'BASKETBALL': return 'Basketball';
    case 'ENFANTS': return 'Aires de jeux';
    default: return category;
  }
}

/** Durée entre deux dates ISO, formatée "1h 24min" / "8 min". */
export function formatDuration(startIso: string, endIso?: string | null): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const totalMinutes = Math.max(0, Math.round((end - start) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

export const MOTIF_LABELS: Record<string, string> = {
  TERMINAISON_VOLONTAIRE: 'Terminée volontairement',
  SORTIE_DE_ZONE: 'Sortie de zone',
  EXPIRATION_AUTOMATIQUE: 'Expirée automatiquement',
};
