// ============================================================================
// File: AffluenceService.java
// ============================================================================
package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.affluence.DeclarationAffluenceRequest;
import ma.smartypark.smartypark_backend.entity.StatutAffluence;

public interface AffluenceService {

    void declarer(Long espaceId, DeclarationAffluenceRequest request);

    StatutAffluence getStatutActuel(Long espaceId);
}