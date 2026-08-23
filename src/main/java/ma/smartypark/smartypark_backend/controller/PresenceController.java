package ma.smartypark.smartypark_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.presence.PresenceRequest;
import ma.smartypark.smartypark_backend.dto.presence.PresenceResponse;
import ma.smartypark.smartypark_backend.service.PresenceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presences")
@RequiredArgsConstructor
public class PresenceController {

    private final PresenceService presenceService;

    @PostMapping("/demarrer")
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<PresenceResponse> demarrer(@Valid @RequestBody PresenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presenceService.demarrer(request));
    }

    @PostMapping("/terminer")
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<PresenceResponse> terminer() {
        return ResponseEntity.ok(presenceService.terminer());
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<PresenceResponse> findActiveByCurrentUser() {
        return ResponseEntity.ok(presenceService.findActiveByCurrentUser());
    }

    @GetMapping("/has-active")
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<Boolean> hasActivePresence() {
        return ResponseEntity.ok(presenceService.hasActivePresence());
    }

    @GetMapping("/espace/{espacePublicId}")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<PresenceResponse>> findActiveByEspace(@PathVariable Long espacePublicId) {
        return ResponseEntity.ok(presenceService.findActiveByEspace(espacePublicId));
    }

    @GetMapping("/espace/{espacePublicId}/count")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<Long> compterActifsDansEspace(@PathVariable Long espacePublicId) {
        return ResponseEntity.ok(presenceService.compterActifsDansEspace(espacePublicId));
    }
}