package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.presence.PresenceRequest;
import ma.smartypark.smartypark_backend.dto.presence.PresenceResponse;
import ma.smartypark.smartypark_backend.dto.presence.VerifPositionRequest;
import ma.smartypark.smartypark_backend.dto.presence.VerifPositionResponse;

import java.util.List;

public interface PresenceService {

    PresenceResponse demarrer(PresenceRequest request);

    PresenceResponse terminer();

    PresenceResponse findActiveByCurrentUser();

    boolean hasActivePresence();

    List<PresenceResponse> findActiveByEspace(Long espacePublicId);

    Long compterActifsDansEspace(Long espacePublicId);

    /**
     * Historique complet des présences (actives et terminées) dans un
     * espace, du plus récent au plus ancien. Réservé aux modérateurs/admins.
     */
    List<PresenceResponse> findHistoriqueByEspace(Long espacePublicId);

    void cloturerPresencesInactives();

    /**
     * Vérifie la position GPS de l'utilisateur par rapport à l'espace public
     * de sa présence active. Si l'utilisateur est sorti de la zone autorisée,
     * la présence est automatiquement terminée.
     *
     * @param request Coordonnées GPS actuelles de l'utilisateur
     * @return Réponse indiquant si l'utilisateur est dans la zone et l'état de sa présence
     */
    VerifPositionResponse verifierPosition(VerifPositionRequest request);
}