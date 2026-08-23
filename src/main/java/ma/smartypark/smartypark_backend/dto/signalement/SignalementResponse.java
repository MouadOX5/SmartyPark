package ma.smartypark.smartypark_backend.dto.signalement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.StatutSignalement;
import ma.smartypark.smartypark_backend.entity.TypeSignalement;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementResponse {

    private Long id;
    private TypeSignalement type;
    private String description;
    private LocalDateTime dateCreation;
    private StatutSignalement statut;
    private String commentaireModerateur;

    private boolean photoDisponible;

    // Informations minimales de l'espace public
    private Long espacePublicId;
    private String espacePublicNom;

    // Informations minimales de l'utilisateur
    private Long signaleParkId;
    private String signaleParkNom;
    private String signaleParkPrenom;


}