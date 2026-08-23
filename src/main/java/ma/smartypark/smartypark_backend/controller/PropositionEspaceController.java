package ma.smartypark.smartypark_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceRequest;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceResponse;
import ma.smartypark.smartypark_backend.service.PropositionEspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/propositions")
@RequiredArgsConstructor
public class PropositionEspaceController {

    private final PropositionEspaceService propositionEspaceService;

    @PostMapping
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<PropositionEspaceResponse> creer(@Valid @RequestBody PropositionEspaceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propositionEspaceService.creer(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<PropositionEspaceResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(propositionEspaceService.findById(id));
    }

    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<PropositionEspaceResponse>> findEnAttente() {
        return ResponseEntity.ok(propositionEspaceService.findEnAttente());
    }

    @GetMapping("/mes-propositions")
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<List<PropositionEspaceResponse>> findByCurrentUser() {
        return ResponseEntity.ok(propositionEspaceService.findByCurrentUser());
    }

    @PatchMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<PropositionEspaceResponse> valider(@PathVariable Long id) {
        return ResponseEntity.ok(propositionEspaceService.valider(id));
    }

    @PatchMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<PropositionEspaceResponse> refuser(
            @PathVariable Long id,
            @RequestParam String motifRefus) {
        return ResponseEntity.ok(propositionEspaceService.refuser(id, motifRefus));
    }
}