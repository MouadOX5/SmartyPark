/**
 * Référence à un fichier image sélectionné côté client (caméra ou galerie),
 * avant envoi en multipart/form-data vers le backend.
 */
export interface PhotoFile {
  uri: string;
  name?: string;
  type?: string;
}
