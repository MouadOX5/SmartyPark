package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.presence.PresenceRequest;
import ma.smartypark.smartypark_backend.dto.presence.PresenceResponse;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.entity.Presence;
import ma.smartypark.smartypark_backend.entity.StatutPresence;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.mapper.PresenceMapper;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.repository.PresenceRepository;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.PresenceService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ConflictException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PresenceServiceImpl implements PresenceService {

    private final PresenceRepository presenceRepository;
    private final EspacePublicRepository espacePublicRepository;
    private final PresenceMapper presenceMapper;
    private final UtilisateurService utilisateurService;
    private final JournalService journalService;

    @Override
    @Transactional
    public PresenceResponse demarrer(PresenceRequest request) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        if (presenceRepository.existsByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE)) {
            throw new ConflictException("Vous avez déjà une présence active");
        }

        EspacePublic espace = espacePublicRepository.findById(request.getEspacePublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        if (!espace.getEstValide()) {
            throw new BusinessException("Cet espace public n'est pas validé");
        }

        Presence presence = Presence.builder()
                .utilisateur(utilisateur)
                .espacePublic(espace)
                .statut(StatutPresence.ACTIVE)
                .build();

        return presenceMapper.toResponse(presenceRepository.save(presence));
    }

    @Override
    @Transactional
    public PresenceResponse terminer() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Presence presence = presenceRepository.findByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune présence active en cours"));

        presence.setHeureDepart(LocalDateTime.now());
        presence.setStatut(StatutPresence.TERMINEE);

        return presenceMapper.toResponse(presenceRepository.save(presence));
    }

    @Override
    public PresenceResponse findActiveByCurrentUser() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Presence presence = presenceRepository.findByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune présence active en cours"));

        return presenceMapper.toResponse(presence);
    }

    @Override
    public boolean hasActivePresence() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        return presenceRepository.existsByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE);
    }

    @Override
    public List<PresenceResponse> findActiveByEspace(Long espacePublicId) {
        EspacePublic espace = espacePublicRepository.findById(espacePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        return presenceRepository.findByEspacePublicAndStatut(espace, StatutPresence.ACTIVE).stream()
                .map(presenceMapper::toResponse)
                .toList();
    }

    @Override
    public Long compterActifsDansEspace(Long espacePublicId) {
        EspacePublic espace = espacePublicRepository.findById(espacePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        return presenceRepository.countByEspacePublicAndStatut(espace, StatutPresence.ACTIVE);
    }

    @Override
    @Transactional
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * *") // S'exécute à minuit
    public void cloturerPresencesInactives() {
        LocalDateTime limite = LocalDateTime.now().minusHours(2);

        List<Presence> presencesACloturer = presenceRepository
                .findByStatutAndHeureArriveeBefore(StatutPresence.ACTIVE, limite);

        if (presencesACloturer.isEmpty()) {
            return;
        }

        // 1. Récupération des emails des utilisateurs impactés
        List<String> emailsUtilisateurs = presencesACloturer.stream()
                .map(presence -> presence.getUtilisateur().getEmail())
                .toList();

        // 2. Mise à jour des présences
        for (Presence presence : presencesACloturer) {
            presence.setHeureDepart(LocalDateTime.now());
            presence.setStatut(StatutPresence.TERMINEE);
        }

        presenceRepository.saveAll(presencesACloturer);

        // 3. Formattage du détail du log
        String details = String.format(
                "%d présence(s) inactive(s) fermée(s) pour : %s",
                presencesACloturer.size(),
                String.join(", ", emailsUtilisateurs)
        );

        // 4. Appel au log (SecurityContext étant null, JournalServiceImpl basculera sur logSysteme)
        journalService.log("CLOTURE_PRESENCES_AUTOMATIQUE", details);
    }
}