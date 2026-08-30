package ma.smartypark.smartypark_backend.dto.presence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.MotifTerminaisonPresence;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifPositionResponse {

    /** true si l'utilisateur est dans le périmètre autorisé */
    private boolean dansZone;

    /** Distance entre l'utilisateur et l'espace public (en mètres) */
    private double distanceMetres;

    /** true si une présence est encore active après la vérification */
    private boolean presenceActive;

    /** Motif de terminaison si la présence a été clôturée automatiquement (ex: "SORTIE_DE_ZONE") */
    private MotifTerminaisonPresence motif;
}