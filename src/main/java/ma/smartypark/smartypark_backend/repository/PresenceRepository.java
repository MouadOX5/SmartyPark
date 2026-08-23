package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.entity.Presence;
import ma.smartypark.smartypark_backend.entity.StatutPresence;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PresenceRepository extends JpaRepository<Presence, Long> {

    Optional<Presence> findByUtilisateurAndStatut(Utilisateur utilisateur, StatutPresence statut);

    boolean existsByUtilisateurAndStatut(Utilisateur utilisateur, StatutPresence statut);

    List<Presence> findByEspacePublicAndStatut(EspacePublic espacePublic, StatutPresence statut);

    Long countByEspacePublicAndStatut(EspacePublic espacePublic, StatutPresence statut);

    List<Presence> findByStatutAndHeureArriveeBefore(StatutPresence statut, LocalDateTime dateLimite);

}