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

        Long utilisateurId = null;
        String utilisateurNom = null;
        String utilisateurPrenom = null;

        if (presence.getUtilisateur() != null) {
            utilisateurId = presence.getUtilisateur().getId();
            utilisateurNom = presence.getUtilisateur().getNom();
            utilisateurPrenom = presence.getUtilisateur().getPrenom();
        }

        return PresenceResponse.builder()
                .id(presence.getId())
                .heureArrivee(presence.getHeureArrivee())
                .heureDepart(presence.getHeureDepart())
                .statut(presence.getStatut())
                .espacePublicId(espacePublicId)
                .espacePublicNom(espacePublicNom)
                .utilisateurId(utilisateurId)
                .utilisateurNom(utilisateurNom)
                .utilisateurPrenom(utilisateurPrenom)
                .distanceDeclarationMetres(presence.getDistanceDeclarationMetres())
                .motifTerminaison(presence.getMotifTerminaison())
                .build();
    }
}