package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {

    List<Signalement> findByStatut(StatutSignalement statut);

    List<Signalement> findByType(TypeSignalement type);

    List<Signalement> findByEspacePublic(EspacePublic espacePublic);

    List<Signalement> findBySignalePark(Utilisateur utilisateur);

    List<Signalement> findByEspacePublicAndStatut(EspacePublic espacePublic, StatutSignalement statut);

    List<Signalement> findByStatutAndType(StatutSignalement statut, TypeSignalement type);

    boolean existsBySignaleParkAndEspacePublicAndTypeAndStatut(
            Utilisateur signalePark,
            EspacePublic espacePublic,
            TypeSignalement type,
            StatutSignalement statut
    );
}