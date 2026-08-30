package ma.smartypark.smartypark_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.espace.EspacePublicRequest;
import ma.smartypark.smartypark_backend.dto.espace.EspacePublicResponse;
import ma.smartypark.smartypark_backend.entity.CategorieEspace;
import ma.smartypark.smartypark_backend.service.EspacePublicService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/espaces-publics")
@RequiredArgsConstructor
public class EspacePublicController {

    private final EspacePublicService espacePublicService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<EspacePublicResponse> create(
            @RequestPart("espace") @Valid EspacePublicRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED).body(espacePublicService.create(request, image));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<EspacePublicResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(espacePublicService.findById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<EspacePublicResponse>> findAllValidated() {
        return ResponseEntity.ok(espacePublicService.findAllValidated());
    }

    @GetMapping("/tous")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<EspacePublicResponse>> findAll() {
        return ResponseEntity.ok(espacePublicService.findAll());
    }

    @GetMapping("/categorie/{categorie}")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<EspacePublicResponse>> findByCategorie(@PathVariable CategorieEspace categorie) {
        return ResponseEntity.ok(espacePublicService.findByCategorie(categorie));
    }

    @GetMapping("/recherche")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<EspacePublicResponse>> searchByNom(@RequestParam String nom) {
        return ResponseEntity.ok(espacePublicService.searchByNom(nom));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<EspacePublicResponse> update(
            @PathVariable Long id,
            @RequestPart("espace") @Valid EspacePublicRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(espacePublicService.update(id, request, image));
    }

    @PatchMapping("/{id}/valider")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<EspacePublicResponse> validate(@PathVariable Long id) {
        return ResponseEntity.ok(espacePublicService.validate(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        espacePublicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}