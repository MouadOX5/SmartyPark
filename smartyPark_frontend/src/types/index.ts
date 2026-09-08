/**
 * SMARTYPARK - SOURCE DE VÉRITÉ TYPESCRIPT
 * Dérivé exactement des entités, DTOs et enums Spring Boot
 */

// ==========================================
// ENUMS
// ==========================================

export type CategorieEspace = 'STREET_WORKOUT' | 'FOOTBALL' | 'BASKETBALL' | 'ENFANTS';

export type Role = 'MOBILE_USER' | 'MODERATEUR' | 'ADMINISTRATEUR';

export type StatutAffluence = 'INCONNU' | 'DISPONIBLE' | 'PRESQUE_SATURE' | 'SATURE';

export type StatutPresence = 'ACTIVE' | 'TERMINEE';

export type StatutProposition = 'EN_ATTENTE' | 'VALIDEE' | 'REJETEE';

export type StatutSignalement = 'EN_ATTENTE' | 'TRAITE' | 'REJETE';

export type TypeSignalement = 'PROPRETE' | 'EQUIPEMENT' | 'SECURITE' | 'AUTRE';

export type TypeNotification =
  | 'PROPOSITION_VALIDEE'
  | 'PROPOSITION_REJETEE'
  | 'SIGNALEMENT_TRAITE'
  | 'SIGNALEMENT_REJETE';

// ==========================================
// AUTH & UTILISATEUR DTOs
// ==========================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  telephone?: string;
  photoProfil?: string;
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

// ==========================================
// ESPACE PUBLIC DTOs
// ==========================================

export interface EspacePublicRequest {
  nom: string;
  description: string;
  categorie: CategorieEspace;
  adresse: string;
  latitude: number;
  longitude: number;
  capaciteMax?: number;
  imageUrl?: string | null;
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

// ==========================================
// PRESENCE DTOs
// ==========================================

export interface PresenceRequest {
  espacePublicId: number;
  latitude: number;
  longitude: number;
}

export interface PresenceResponse {
  id: number;
  heureArrivee: string;
  heureDepart?: string;
  statut: StatutPresence;
  espacePublicId: number;
  espacePublicNom: string;
  utilisateurId?: number;
  utilisateurNom?: string;
  utilisateurPrenom?: string;
  // NB : le backend renvoie "distanceDeclarationMetres" (voir PresenceResponse.java).
  distanceDeclarationMetres?: number;
  motifTerminaison?: string;
}

// ==========================================
// AFFLUENCE DTOs
// ==========================================

export interface DeclarationAffluenceRequest {
  statutAffluence: StatutAffluence;
  latitude: number;
  longitude: number;
}

export interface AffluenceResponse {
  statutAffluence: StatutAffluence;
}

// ==========================================
// SIGNALEMENT DTOs
// ==========================================

export interface SignalementRequest {
  type: TypeSignalement;
  description: string;
  espacePublicId: number;
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

// ==========================================
// PROPOSITION DTOs
// ==========================================

export interface PropositionEspaceRequest {
  nom: string;
  description: string;
  categorie: CategorieEspace;
  adresse: string;
  latitude: number;
  longitude: number;
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

// ==========================================
// JOURNAL DTOs
// ==========================================

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

// ==========================================
// NOTIFICATION DTOs
// ==========================================

export interface NotificationResponse {
  id: number;
  type: TypeNotification;
  titre: string;
  message: string;
  estLue: boolean;
  referenceId?: number;
  dateCreation: string;
}

// ==========================================
// UI HELPER TYPES
// ==========================================

export interface CategoryOption {
  key: string;
  label: string;
  category?: CategorieEspace;
  iconName: string;
}
