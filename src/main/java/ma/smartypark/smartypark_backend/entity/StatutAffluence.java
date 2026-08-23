package ma.smartypark.smartypark_backend.entity;

/**
 * Représente l'état de disponibilité/saturation d'un EspacePublic.
 * Calculé automatiquement à partir du nombre de présences actives
 * et de la capacité maximale du Park.
 */
public enum StatutAffluence  {
    INCONNU,

    /** Occupation inférieure au seuil de saturation (ex. < 80 %) */
    DISPONIBLE,

    /** Occupation supérieure ou égale au seuil, mais inférieure à la capacité max */
    PRESQUE_SATURE,

    /** Occupation supérieure ou égale à la capacité maximale */
    SATURE
}
