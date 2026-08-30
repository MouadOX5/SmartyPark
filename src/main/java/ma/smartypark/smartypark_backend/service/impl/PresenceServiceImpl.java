package ma.smartypark.smartypark_backend.service.impl;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.presence.PresenceRequest;
import ma.smartypark.smartypark_backend.dto.presence.PresenceResponse;
import ma.smartypark.smartypark_backend.dto.presence.VerifPositionRequest;
import ma.smartypark.smartypark_backend.dto.presence.VerifPositionResponse;
import ma.smartypark.smartypark_backend.entity.*;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ConflictException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.mapper.PresenceMapper;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.repository.PresenceRepository;
import ma.smartypark.smartypark_backend.service.GeoDistanceService;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.PresenceService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PresenceServiceImpl implements PresenceService {

    @Value("${presence.geofence.radius-meters:100}")
    private double geofenceRadiusMeters;

    private final PresenceRepository presenceRepository;
    private final EspacePublicRepository espacePublicRepository;
    private final PresenceMapper presenceMapper;
    private final UtilisateurService utilisateurService;
    private final JournalService journalService;
    private final GeoDistanceService geoDistanceService;

    // =========================================================================
    // RM-PRES-01 : Vérification de proximité GPS lors de la déclaration
    // =========================================================================
    @Override
    @Transactional
    public PresenceResponse demarrer(PresenceRequest request) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        // RM-PRES-02 : Une seule présence active
        if (presenceRepository.existsByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE)) {
            throw new ConflictException("Vous avez déjà une présence active");
        }

        EspacePublic espace = espacePublicRepository.findById(request.getEspacePublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        // RM-PRES-03 : L'espace doit être validé
        if (!espace.getEstValide()) {
            throw new BusinessException("Cet espace public n'est pas validé");
        }

        // RM-PRES-01 : Vérification de proximité GPS
        double distance = geoDistanceService.calculateDistanceInMeters(
                request.getLatitude(), request.getLongitude(),
                espace.getLatitude(), espace.getLongitude()
        );

        if (distance > geofenceRadiusMeters) {
            throw new BusinessException(
                    "Vous devez être à proximité de cet espace pour déclarer votre présence. " +
                            "Distance actuelle : " + String.format("%.1f", distance) + " mètres."
            );
        }

        Presence presence = Presence.builder()
                .utilisateur(utilisateur)
                .espacePublic(espace)
                .statut(StatutPresence.ACTIVE)
                .latitudeDeclaration(request.getLatitude())
                .longitudeDeclaration(request.getLongitude())
                .distanceDeclarationMetres(distance)
                .build();

        PresenceResponse response = presenceMapper.toResponse(presenceRepository.save(presence));

        journalService.log(
                "DEMARRAGE_PRESENCE",
                String.format(
                        "Utilisateur %s %s (ID : %d) a déclaré sa présence dans l'espace '%s' (ID : %d) " +
                                "à %.1f mètres de distance.",
                        utilisateur.getPrenom(),
                        utilisateur.getNom(),
                        utilisateur.getId(),
                        espace.getNom(),
                        espace.getId(),
                        distance
                )
        );

        return response;
    }

    // =========================================================================
    // RM-PRES-08 : Terminaison volontaire
    // =========================================================================
    @Override
    @Transactional
    public PresenceResponse terminer() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Presence presence = presenceRepository.findByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune présence active en cours"));

        presence.setHeureDepart(LocalDateTime.now());
        presence.setStatut(StatutPresence.TERMINEE);
        presence.setMotifTerminaison(
                MotifTerminaisonPresence.TERMINAISON_VOLONTAIRE
        );

        PresenceResponse response = presenceMapper.toResponse(presenceRepository.save(presence));

        journalService.log(
                "TERMINAISON_PRESENCE_VOLONTAIRE",
                String.format(
                        "Utilisateur %s %s (ID : %d) a terminé volontairement sa présence dans l'espace '%s' (ID : %d).",
                        utilisateur.getPrenom(),
                        utilisateur.getNom(),
                        utilisateur.getId(),
                        presence.getEspacePublic().getNom(),
                        presence.getEspacePublic().getId()
                )
        );

        return response;
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

    // =========================================================================
    // RM-PRES-04 & RM-PRES-06 : Vérification de position et sortie de zone
    // =========================================================================
    @Override
    @Transactional
    public VerifPositionResponse verifierPosition(VerifPositionRequest request) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        // 1. Rechercher la présence active de l'utilisateur
        Presence presence = presenceRepository.findByUtilisateurAndStatut(utilisateur, StatutPresence.ACTIVE)
                .orElse(null);

        if (presence == null) {
            return VerifPositionResponse.builder()
                    .dansZone(false)
                    .distanceMetres(-1.0)
                    .presenceActive(false)
                    .motif(null)
                    .build();
        }

        EspacePublic espace = presence.getEspacePublic();

        // 2. Calculer la distance actuelle
        double distance = geoDistanceService.calculateDistanceInMeters(
                request.getLatitude(), request.getLongitude(),
                espace.getLatitude(), espace.getLongitude()
        );

        // 3. Vérifier si l'utilisateur est toujours dans la zone
        boolean dansZone = distance <= geofenceRadiusMeters;

        if (dansZone) {
            // L'utilisateur est dans la zone → présence conserve son statut ACTIVE
            return VerifPositionResponse.builder()
                    .dansZone(true)
                    .distanceMetres(distance)
                    .presenceActive(true)
                    .motif(null)
                    .build();
        }

        // 4. Sortie de zone détectée → terminer automatiquement la présence
        presence.setHeureDepart(LocalDateTime.now());
        presence.setStatut(StatutPresence.TERMINEE);
        presence.setMotifTerminaison(
                MotifTerminaisonPresence.SORTIE_DE_ZONE
        );

        presenceRepository.save(presence);

        journalService.log(
                "SORTIE_ZONE_PRESENCE",
                String.format(
                        "Présence de l'utilisateur %s %s (ID : %d) dans l'espace '%s' (ID : %d) " +
                                "terminée automatiquement (sortie de zone). Distance : %.1f mètres (rayon : %.0f m).",
                        utilisateur.getPrenom(),
                        utilisateur.getNom(),
                        utilisateur.getId(),
                        espace.getNom(),
                        espace.getId(),
                        distance,
                        geofenceRadiusMeters
                )
        );

        return VerifPositionResponse.builder()
                .dansZone(false)
                .distanceMetres(distance)
                .presenceActive(false)
                .motif(MotifTerminaisonPresence.SORTIE_DE_ZONE)
                .build();
    }

    // =========================================================================
    // RM-PRES-09 : Clôture automatique des présences oubliées (mécanisme de sécurité)
    // =========================================================================
    @Override
    @Transactional
    @Scheduled(fixedRate = 15 * 60 * 1000)
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
            presence.setMotifTerminaison(
                    MotifTerminaisonPresence.EXPIRATION_AUTOMATIQUE
            );
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