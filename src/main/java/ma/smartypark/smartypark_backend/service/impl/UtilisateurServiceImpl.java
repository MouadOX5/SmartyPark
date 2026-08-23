package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;
import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.mapper.UtilisateurMapper;
import ma.smartypark.smartypark_backend.repository.UtilisateurRepository;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final JournalService journalService;

    @Override
    public UtilisateurResponse findById(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return utilisateurMapper.toResponse(utilisateur);
    }

    @Override
    public UtilisateurResponse findByEmail(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        return utilisateurMapper.toResponse(utilisateur);
    }

    @Override
    public boolean existsByEmail(String email) {
        return utilisateurRepository.existsByEmail(email);
    }

    @Override
    public List<UtilisateurResponse> findAll() {
        return utilisateurRepository.findAll().stream()
                .map(utilisateurMapper::toResponse)
                .toList();
    }

    @Override
    public List<UtilisateurResponse> findByRole(Role role) {
        return utilisateurRepository.findByRole(role).stream()
                .map(utilisateurMapper::toResponse)
                .toList();
    }

    @Override
    public List<UtilisateurResponse> findByEstActif(Boolean estActif) {
        return utilisateurRepository.findByEstActif(estActif).stream()
                .map(utilisateurMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public UtilisateurResponse update(Long id, String nom, String prenom, String telephone, String photoProfil) {


        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));


        utilisateur.setNom(nom);
        utilisateur.setPrenom(prenom);
        utilisateur.setTelephone(telephone);
        utilisateur.setPhotoProfil(photoProfil);

        Utilisateur utilisateurModifie =
                utilisateurRepository.save(utilisateur);


        journalService.log(
                "MODIFICATION_UTILISATEUR",
                "Modification des informations de l'utilisateur '"
                        + utilisateurModifie.getEmail()
                        + "' (ID : "
                        + utilisateurModifie.getId()
                        + ")"
        );

        return utilisateurMapper.toResponse(utilisateurModifie);
    }


    @Override
    @Transactional
    public UtilisateurResponse toggleActif(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));

        utilisateur.setEstActif(!utilisateur.getEstActif());


        Utilisateur utilisateurModifie =
                utilisateurRepository.save(utilisateur);

        String action = utilisateurModifie.getEstActif()
                ? "ACTIVATION_UTILISATEUR"
                : "DESACTIVATION_UTILISATEUR";

        String details = utilisateurModifie.getEstActif()
                ? "Activation de l'utilisateur '" + utilisateurModifie.getEmail()
                  + "' (ID : " + utilisateurModifie.getId() + ")"
                : "Désactivation de l'utilisateur '" + utilisateurModifie.getEmail()
                  + "' (ID : " + utilisateurModifie.getId() + ")";

        journalService.log(action, details);


        return utilisateurMapper.toResponse(utilisateurModifie);
    }




    @Override
    @Transactional
    public void delete(Long id) {

        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Utilisateur introuvable"));

        utilisateurRepository.deleteById(id);

        journalService.log(
                "SUPPRESSION_UTILISATEUR",
                "Suppression de l'utilisateur '"
                        + utilisateur.getEmail()
                        + "' (ID : "
                        + utilisateur.getId()
                        + ")"
        );
    }

    @Override
    public Utilisateur getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur authentifié introuvable"));
    }

    @Override
    public UtilisateurResponse getProfile() {
        Utilisateur utilisateur = getCurrentUser(); // Récupère l'utilisateur depuis le SecurityContext[cite: 11]
        return utilisateurMapper.toResponse(utilisateur); // Retourne le DTO[cite: 11]
    }
}