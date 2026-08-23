package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.presence.PresenceResponse;
import ma.smartypark.smartypark_backend.entity.Presence;
import org.springframework.stereotype.Component;

@Component
public class PresenceMapper {

    public PresenceResponse toResponse(Presence presence) {
        if (presence == null) {
            return null;
        }

        Long espacePublicId = null;
        String espacePublicNom = null;

        if (presence.getEspacePublic() != null) {
            espacePublicId = presence.getEspacePublic().getId();
            espacePublicNom = presence.getEspacePublic().getNom();
        }

        return PresenceResponse.builder()
                .id(presence.getId())
                .heureArrivee(presence.getHeureArrivee())
                .heureDepart(presence.getHeureDepart())
                .statut(presence.getStatut())
                .espacePublicId(espacePublicId)
                .espacePublicNom(espacePublicNom)
                .build();
    }
}