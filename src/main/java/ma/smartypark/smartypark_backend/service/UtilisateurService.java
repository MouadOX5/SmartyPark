package ma.smartypark.smartypark_backend.service;


import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;
import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.entity.Utilisateur;

import java.util.List;

public interface UtilisateurService {

    UtilisateurResponse findById(Long id);

    UtilisateurResponse findByEmail(String email);

    boolean existsByEmail(String email);

    List<UtilisateurResponse> findAll();

    List<UtilisateurResponse> findByRole(Role role);

    List<UtilisateurResponse> findByEstActif(Boolean estActif);

    UtilisateurResponse update(Long id, String nom, String prenom, String telephone, String photoProfil);

    UtilisateurResponse toggleActif(Long id);

    void delete(Long id);

    Utilisateur getCurrentUser();

    UtilisateurResponse getProfile();
}