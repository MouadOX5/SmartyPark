package ma.smartypark.smartypark_backend.entity;

/**
 * Types d'événements pouvant générer une notification pour un utilisateur.
 */
public enum TypeNotification {
    PROPOSITION_VALIDEE,
    PROPOSITION_REJETEE,
    SIGNALEMENT_TRAITE,
    SIGNALEMENT_REJETE,
    // Notifications destinées aux MODERATEUR/ADMINISTRATEUR
    NOUVELLE_PROPOSITION,
    NOUVEAU_SIGNALEMENT
}
