package ma.smartypark.smartypark_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceRequest;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceResponse;
import ma.smartypark.smartypark_backend.service.PropositionEspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/propositions")
@RequiredArgsConstructor
public class PropositionEspaceController {

    private final PropositionEspaceService propositionEspaceService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<PropositionEspaceResponse> creer(
            @RequestPart("proposition") @Valid PropositionEspaceRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED).body(propositionEspaceService.creer(request, image));
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