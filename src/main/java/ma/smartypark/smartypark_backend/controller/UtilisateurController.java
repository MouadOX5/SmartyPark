package ma.smartypark.smartypark_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;
import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UtilisateurResponse>> findAll() {
        return ResponseEntity.ok(utilisateurService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.findById(id));
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurResponse> findByEmail(@PathVariable String email) {
        return ResponseEntity.ok(utilisateurService.findByEmail(email));
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UtilisateurResponse>> findByRole(@PathVariable Role role) {
        return ResponseEntity.ok(utilisateurService.findByRole(role));
    }

    @GetMapping("/actif/{estActif}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<UtilisateurResponse>> findByEstActif(@PathVariable Boolean estActif) {
        return ResponseEntity.ok(utilisateurService.findByEstActif(estActif));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurResponse> update(
            @PathVariable Long id,
            @RequestParam String nom,
            @RequestParam String prenom,
            @RequestParam(required = false) String telephone,
            @RequestParam(required = false) String photoProfil) {
        return ResponseEntity.ok(utilisateurService.update(id, nom, prenom, telephone, photoProfil));
    }

    @PatchMapping("/{id}/toggle-actif")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurResponse> toggleActif(@PathVariable Long id) {
        return ResponseEntity.ok(utilisateurService.toggleActif(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        utilisateurService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('MOBILE_USER', 'MODERATEUR', 'ADMINISTRATEUR')")
    public ResponseEntity<UtilisateurResponse> getProfile() {
        return ResponseEntity.ok(utilisateurService.getProfile());
    }

}