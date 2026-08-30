// ============================================================================
// File: DeclarationAffluenceRepository.java
// ============================================================================
package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.DeclarationAffluence;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeclarationAffluenceRepository extends JpaRepository<DeclarationAffluence, Long> {

    /**
     * Déclarations récentes d'un espace (fenêtre temporelle glissante).
     * Utilisée pour le calcul du score récent.
     */
    List<DeclarationAffluence>
    findByEspacePublicAndDateDeclarationAfter(EspacePublic espacePublic, LocalDateTime date);

    /**
     * Déclarations historiques d'un espace pour un jour de semaine donné,
     * dans une fenêtre horaire autour de l'heure actuelle.
     * Utilisée pour le calcul du score historique.
     *
     * @param /*espacePublic L'espace concerné
     * @param /* debutDébut   Début de la période historique (ex: il y a 3 mois)
     * @param /* debutFin     Fin de la période historique (ex: hier)
     * @param /* heureMin     Heure minimale de la fenêtre (ex: 13:00)
     * @param /* heureMax     Heure maximale de la fenêtre (ex: 13:30)
     * @param /* dayOfWeek    Jour de la semaine (1=Lundi, 7=Dimanche)
     */
    List<DeclarationAffluence> findByEspacePublicAndDateDeclarationBetween(
            EspacePublic espacePublic,
            LocalDateTime debut,
            LocalDateTime fin
    );
}