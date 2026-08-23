package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.presence.PresenceRequest;
import ma.smartypark.smartypark_backend.dto.presence.PresenceResponse;

import java.util.List;

public interface PresenceService {

    PresenceResponse demarrer(PresenceRequest request);

    PresenceResponse terminer();

    PresenceResponse findActiveByCurrentUser();

    boolean hasActivePresence();

    List<PresenceResponse> findActiveByEspace(Long espacePublicId);

    Long compterActifsDansEspace(Long espacePublicId);

    void cloturerPresencesInactives();
}