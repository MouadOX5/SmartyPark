package ma.smartypark.smartypark_backend.dto.presence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.MotifTerminaisonPresence;
import ma.smartypark.smartypark_backend.entity.StatutPresence;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresenceResponse {

    private Long id;
    private LocalDateTime heureArrivee;
    private LocalDateTime heureDepart;
    private StatutPresence statut;

    // Informations minimales de l'espace public
    private Long espacePublicId;
    private String espacePublicNom;

    /** Distance entre l'utilisateur et l'espace au moment de la déclaration (en mètres) */
    private Double distanceDeclarationMetres;

    /** Motif de terminaison : TERMINAISON_VOLONTAIRE, SORTIE_DE_ZONE, EXPIRATION_AUTOMATIQUE */
    private MotifTerminaisonPresence motifTerminaison;
}