package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.signalement.SignalementRequest;
import ma.smartypark.smartypark_backend.dto.signalement.SignalementResponse;
import ma.smartypark.smartypark_backend.entity.Signalement;
import org.springframework.stereotype.Component;

@Component
public class SignalementMapper {

    public Signalement toEntity(SignalementRequest request) {
        if (request == null) {
            return null;
        }

        return Signalement.builder()
                .type(request.getType())
                .description(request.getDescription())
                .build();
    }

    public SignalementResponse toResponse(Signalement signalement) {
        if (signalement == null) {
            return null;
        }

        Long espacePublicId = null;
        String espacePublicNom = null;

        if (signalement.getEspacePublic() != null) {
            espacePublicId = signalement.getEspacePublic().getId();
            espacePublicNom = signalement.getEspacePublic().getNom();
        }

        Long signaleParkId = null;
        String signaleParkNom = null;
        String signaleParkPrenom = null;

        if (signalement.getSignalePark() != null) {
            signaleParkId = signalement.getSignalePark().getId();
            signaleParkNom = signalement.getSignalePark().getNom();
            signaleParkPrenom = signalement.getSignalePark().getPrenom();
        }

        return SignalementResponse.builder()
                .id(signalement.getId())
                .type(signalement.getType())
                .description(signalement.getDescription())
                .dateCreation(signalement.getDateCreation())
                .statut(signalement.getStatut())
                .commentaireModerateur(signalement.getCommentaireModerateur())
                .photoDisponible(
                        signalement.getPhotoPath() != null
                                && !signalement.getPhotoPath().isBlank()
                )
                .espacePublicId(espacePublicId)
                .espacePublicNom(espacePublicNom)
                .signaleParkId(signaleParkId)
                .signaleParkNom(signaleParkNom)
                .signaleParkPrenom(signaleParkPrenom)
                .build();
    }
}