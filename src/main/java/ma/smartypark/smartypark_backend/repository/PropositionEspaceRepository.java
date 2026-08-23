package ma.smartypark.smartypark_backend.repository;

import jakarta.validation.constraints.NotBlank;
import ma.smartypark.smartypark_backend.entity.PropositionEspace;
import ma.smartypark.smartypark_backend.entity.StatutProposition;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PropositionEspaceRepository extends JpaRepository<PropositionEspace, Long> {

    List<PropositionEspace> findByStatut(StatutProposition statut);

    List<PropositionEspace> findByProposePark(Utilisateur utilisateur);

    List<PropositionEspace> findByStatutAndProposePark(StatutProposition statut, Utilisateur utilisateur);

    boolean existsByNomAndAdresseAndStatutIn(String nom, String adresse, List<StatutProposition> statuts);

}