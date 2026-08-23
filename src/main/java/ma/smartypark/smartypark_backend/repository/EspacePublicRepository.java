package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.CategorieEspace;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EspacePublicRepository extends JpaRepository<EspacePublic, Long> {

    List<EspacePublic> findByEstValideTrue();

    List<EspacePublic> findByCategorie(CategorieEspace categorie);

    List<EspacePublic> findByEstValideTrueAndCategorie(CategorieEspace categorie);

    List<EspacePublic> findByNomContainingIgnoreCase(String nom);

    List<EspacePublic> findByEstValideTrueAndNomContainingIgnoreCase(String nom);
}