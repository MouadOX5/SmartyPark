package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.DeclarationAffluence;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeclarationAffluenceRepository extends JpaRepository<DeclarationAffluence, Long> {

    List<DeclarationAffluence>
    findByEspacePublicAndDateDeclarationAfter(EspacePublic espacePublic, LocalDateTime date);
}