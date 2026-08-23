package ma.smartypark.smartypark_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.affluence.AffluenceResponse;
import ma.smartypark.smartypark_backend.dto.affluence.DeclarationAffluenceRequest;
import ma.smartypark.smartypark_backend.entity.StatutAffluence;
import ma.smartypark.smartypark_backend.service.AffluenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/espaces-publics/{espaceId}/affluence")
@RequiredArgsConstructor
public class AffluenceController {

    private final AffluenceService affluenceService;

    @PostMapping
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<Void> declarer(
            @PathVariable Long espaceId,
            @Valid @RequestBody DeclarationAffluenceRequest request) {
        affluenceService.declarer(espaceId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<AffluenceResponse> getStatutActuel(@PathVariable Long espaceId) {
        StatutAffluence statut = affluenceService.getStatutActuel(espaceId);
        return ResponseEntity.ok(new AffluenceResponse(statut));
    }
}