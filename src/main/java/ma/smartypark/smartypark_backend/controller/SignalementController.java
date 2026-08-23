package ma.smartypark.smartypark_backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.signalement.SignalementRequest;
import ma.smartypark.smartypark_backend.dto.signalement.SignalementResponse;
import ma.smartypark.smartypark_backend.entity.StatutSignalement;
import ma.smartypark.smartypark_backend.entity.TypeSignalement;
import ma.smartypark.smartypark_backend.service.SignalementService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/signalements")
@RequiredArgsConstructor
public class SignalementController {

    private final SignalementService signalementService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('MOBILE_USER')")
    public ResponseEntity<SignalementResponse> creer(

            @RequestPart("signalement")
            @Valid SignalementRequest request,

            @RequestPart(value = "photo", required = false)
            MultipartFile photo
    ) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(signalementService.creer(request, photo));
    }




    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<SignalementResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(signalementService.findById(id));
    }

    @GetMapping("/en-attente")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<SignalementResponse>> findEnAttente() {
        return ResponseEntity.ok(signalementService.findEnAttente());
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<SignalementResponse>> findByType(@PathVariable TypeSignalement type) {
        return ResponseEntity.ok(signalementService.findByType(type));
    }

    @GetMapping("/espace/{espacePublicId}")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<List<SignalementResponse>> findByEspace(@PathVariable Long espacePublicId) {
        return ResponseEntity.ok(signalementService.findByEspace(espacePublicId));
    }

    @PatchMapping("/{id}/traiter")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<SignalementResponse> traiter(
            @PathVariable Long id,
            @RequestParam StatutSignalement nouveauStatut,
            @RequestParam String commentaireModerateur) {
        return ResponseEntity.ok(signalementService.traiter(id, nouveauStatut, commentaireModerateur));
    }

    // ============================================================
    // NOUVEAU — consultation de la photo
    // ============================================================
    @GetMapping("/{id}/photo")
    @PreAuthorize("hasAnyRole('MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<Resource> getPhoto(@PathVariable Long id) {
        Resource resource = signalementService.getPhoto(id);

        String contentType = determineContentType(resource);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    private String determineContentType(Resource resource) {
        String filename = resource.getFilename();
        if (filename != null) {
            String ext = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            switch (ext) {
                case "jpg":
                case "jpeg":
                    return "image/jpeg";
                case "png":
                    return "image/png";
                case "webp":
                    return "image/webp";
            }
        }
        return "application/octet-stream";
    }

}