package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.journal.JournalResponse;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface JournalService {

    void log(String action, String details);


    void log(
            Utilisateur acteur,
            String action,
            String details);

    List<JournalResponse> findAll();

    List<JournalResponse> findByActeur(Long acteurId);

    List<JournalResponse> findByPeriode(LocalDateTime debut, LocalDateTime fin);

    List<JournalResponse> findByAction(String action);

    List<JournalResponse> findByActeurAndPeriode(Long acteurId, LocalDateTime debut, LocalDateTime fin);


}