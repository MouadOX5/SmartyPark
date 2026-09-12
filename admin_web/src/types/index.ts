/**
 * Types dérivés des DTOs Spring Boot du backend SmartyPark.
 * Gardés cohérents avec smartyPark_frontend/src/types/index.ts (même API).
 */

export type CategorieEspace = 'STREET_WORKOUT' | 'FOOTBALL' | 'BASKETBALL' | 'ENFANTS';

export type Role = 'MOBILE_USER' | 'MODERATEUR' | 'ADMINISTRATEUR';

export type StatutAffluence = 'INCONNU' | 'DISPONIBLE' | 'PRESQUE_SATURE' | 'SATURE';

export type StatutProposition = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';

export type StatutSignalement = 'EN_ATTENTE' | 'TRAITE' | 'REJETE';

export type TypeSignalement = 'PROPRETE' | 'EQUIPEMENT' | 'SECURITE' | 'AUTRE';

export type TypeNotification =
  | 'PROPOSITION_VALIDEE'
  | 'PROPOSITION_REJETEE'
  | 'SIGNALEMENT_TRAITE'
  | 'SIGNALEMENT_REJETE'
  | 'NOUVELLE_PROPOSITION'
  | 'NOUVEAU_SIGNALEMENT';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UtilisateurResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  estActif: boolean;
  role: Role;
  photoProfil?: string;
  dateInscription: string;
}

export interface EspacePublicRequest {
  nom: string;
  description: string;
  categorie: CategorieEspace;
  adresse: string;
  latitude: number;
  longitude: number;
  capaciteMax?: number;
}

export interface EspacePublicResponse {
  id: number;
  nom: string;
  description: string;
  categorie: CategorieEspace;
  adresse: string;
  latitude: number;
  longitude: number;
  estValide: boolean;
  statutAffluenceActuel: StatutAffluence;
  dateCreation: string;
  imageUrl?: string | null;
}

export interface PresenceResponse {
  id: number;
  heureArrivee: string;
  heureDepart?: string;
  statut: 'ACTIVE' | 'TERMINEE';
  espacePublicId: number;
  espacePublicNom: string;
  utilisateurId?: number;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  distanceDeclarationMetres?: number;
  motifTerminaison?: string;
}

export interface SignalementResponse {
  id: number;
  type: TypeSignalement;
  description: string;
  dateCreation: string;
  statut: StatutSignalement;
  commentaireModerateur?: string;
  photoDisponible: boolean;
  espacePublicId: number;
  espacePublicNom: string;
  signaleParkId: number;
  signaleParkNom: string;
  signaleParkPrenom: string;
}

export interface PropositionEspaceResponse {
  id: number;
  nom: string;
  description: string;
  categorie: CategorieEspace;
  adresse: string;
  latitude: number;
  longitude: number;
  statut: StatutProposition;
  motifRefus?: string;
  dateProposition: string;
  imageUrl?: string | null;
  proposeParkId: number;
  proposeParkNom: string;
  proposeParkPrenom: string;
}

export interface JournalResponse {
  id: number;
  dateAction: string;
  action: string;
  details: string;
  acteurId: number;
  acteurNom: string;
  acteurPrenom: string;
  acteurEmail: string;
}

export interface NotificationResponse {
  id: number;
  type: TypeNotification;
  titre: string;
  message: string;
  estLue: boolean;
  referenceId?: number;
  dateCreation: string;
}
