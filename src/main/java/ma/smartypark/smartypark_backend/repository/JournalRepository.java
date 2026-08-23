package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.Journal;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JournalRepository extends JpaRepository<Journal, Long> {

    List<Journal> findByActeur(Utilisateur acteur);

    List<Journal> findByDateActionBetween(LocalDateTime debut, LocalDateTime fin);

    List<Journal> findByActionContainingIgnoreCase(String action);

    List<Journal> findByActeurAndDateActionBetween(Utilisateur acteur, LocalDateTime debut, LocalDateTime fin);
}