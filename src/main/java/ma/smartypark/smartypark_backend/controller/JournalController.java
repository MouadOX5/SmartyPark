package ma.smartypark.smartypark_backend.controller;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.journal.JournalResponse;
import ma.smartypark.smartypark_backend.service.JournalService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/journaux")
@RequiredArgsConstructor
public class JournalController {

    private final JournalService journalService;

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<JournalResponse>> findAll() {
        return ResponseEntity.ok(journalService.findAll());
    }

    @GetMapping("/acteur/{acteurId}")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<JournalResponse>> findByActeur(@PathVariable Long acteurId) {
        return ResponseEntity.ok(journalService.findByActeur(acteurId));
    }

    @GetMapping("/periode")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<JournalResponse>> findByPeriode(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(journalService.findByPeriode(debut, fin));
    }

    @GetMapping("/action")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<JournalResponse>> findByAction(@RequestParam String action) {
        return ResponseEntity.ok(journalService.findByAction(action));
    }

    @GetMapping("/acteur/{acteurId}/periode")
    @PreAuthorize("hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<JournalResponse>> findByActeurAndPeriode(
            @PathVariable Long acteurId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime debut,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        return ResponseEntity.ok(journalService.findByActeurAndPeriode(acteurId, debut, fin));
    }
}