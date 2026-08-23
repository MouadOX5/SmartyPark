package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Utilisateur> findByRole(Role role);

    List<Utilisateur> findByEstActif(Boolean estActif);

    List<Utilisateur> findByRoleAndEstActif(Role role, Boolean estActif);
}