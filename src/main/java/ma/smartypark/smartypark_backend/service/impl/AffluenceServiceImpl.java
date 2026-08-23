package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.affluence.DeclarationAffluenceRequest;
import ma.smartypark.smartypark_backend.entity.DeclarationAffluence;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.entity.StatutAffluence;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.repository.DeclarationAffluenceRepository;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.service.AffluenceService;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AffluenceServiceImpl implements AffluenceService {

    private static final double DISTANCE_MAX_METRES = 500.0;

    private final DeclarationAffluenceRepository declarationAffluenceRepository;
    private final EspacePublicRepository espacePublicRepository;
    private final UtilisateurService utilisateurService;
    private final JournalService journalService;

    @Override
    @Transactional
    public void declarer(Long espaceId, DeclarationAffluenceRequest request) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        EspacePublic espace = espacePublicRepository.findById(espaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        if (!Boolean.TRUE.equals(espace.getEstValide())) {
            throw new BusinessException("Cet espace public n'est pas validé");
        }

        double distance = calculerDistance(
                request.getLatitude(), request.getLongitude(),
                espace.getLatitude(), espace.getLongitude()
        );

        if (distance > DISTANCE_MAX_METRES) {
            throw new BusinessException("Vous êtes trop éloigné de cet espace public pour déclarer son affluence");
        }

        DeclarationAffluence declaration = DeclarationAffluence.builder()
                .espacePublic(espace)
                .utilisateur(utilisateur)
                .statutAffluence(request.getStatutAffluence())
                .build();

        declarationAffluenceRepository.save(declaration);

        StatutAffluence nouveauStatut = calculerStatutMajoritaire(espace);
        espace.setStatutAffluenceActuel(nouveauStatut);
        espacePublicRepository.save(espace);

        journalService.log(
                "DECLARATION_AFFLUENCE",
                String.format(
                        "Utilisateur %s %s (ID : %d) a déclaré %s pour l'espace '%s' (ID : %d)",
                        utilisateur.getPrenom(),
                        utilisateur.getNom(),
                        utilisateur.getId(),
                        request.getStatutAffluence(),
                        espace.getNom(),
                        espace.getId()
                )
        );
    }

    @Override
    @Transactional
    public StatutAffluence getStatutActuel(Long espaceId) {

        EspacePublic espace = espacePublicRepository.findById(espaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Espace public introuvable"));

        StatutAffluence statut = calculerStatutMajoritaire(espace);

        if (espace.getStatutAffluenceActuel() != statut) {
            espace.setStatutAffluenceActuel(statut);
            espacePublicRepository.save(espace);
        }

        return statut;
    }



    private StatutAffluence calculerStatutMajoritaire(EspacePublic espace) {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(60);
        List<DeclarationAffluence> declarations = declarationAffluenceRepository
                .findByEspacePublicAndDateDeclarationAfter(espace, limite);

        if (declarations.isEmpty()) {
            return StatutAffluence.INCONNU;
        }

        Map<StatutAffluence, Long> comptage = declarations.stream()
                .collect(Collectors.groupingBy(
                        DeclarationAffluence::getStatutAffluence,
                        Collectors.counting()
                ));

        long maxCount = comptage.values().stream()
                .max(Long::compareTo)
                .orElse(0L);

        List<StatutAffluence> majoritaires = comptage.entrySet().stream()
                .filter(e -> e.getValue() == maxCount)
                .map(Map.Entry::getKey)
                .toList();

        if (majoritaires.size() == 1) {
            return majoritaires.get(0);
        }

        // Égalité : départage par la déclaration la plus récente
        return declarations.stream()
                .filter(d -> majoritaires.contains(d.getStatutAffluence()))
                .max(Comparator.comparing(DeclarationAffluence::getDateDeclaration))
                .map(DeclarationAffluence::getStatutAffluence)
                .orElse(StatutAffluence.INCONNU);
    }

    private double calculerDistance(float lat1, float lon1, float lat2, float lon2) {
        final int R = 6371000; // Rayon de la Terre en mètres
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}