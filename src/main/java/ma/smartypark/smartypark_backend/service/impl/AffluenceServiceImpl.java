// ============================================================================
// File: AffluenceServiceImpl.java
// ============================================================================
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
import ma.smartypark.smartypark_backend.service.GeoDistanceService;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AffluenceServiceImpl implements AffluenceService {

    // =========================================================================
    // CONSTANTES DE VALORISATION DES STATUTS
    // =========================================================================
    private static final double VALEUR_DISPONIBLE = 1.0;
    private static final double VALEUR_PRESQUE_SATURE = 2.0;
    private static final double VALEUR_SATURE = 3.0;

    // =========================================================================
    // CONFIGURATION CENTRALISÉE (application.properties)
    // =========================================================================
    @Value("${affluence.recent-weight:0.70}")
    private double poidsRecent;

    @Value("${affluence.historical-weight:0.30}")
    private double poidsHistorique;

    @Value("${affluence.recent-window-minutes:60}")
    private int fenetreRecenteMinutes;

    @Value("${affluence.historical-window-minutes:30}")
    private int fenetreHistoriqueMinutes;

    @Value("${affluence.historical-depth-days:90}")
    private int profondeurHistoriqueJours;

    @Value("${affluence.seuil-disponible:1.6}")
    private double seuilDisponible;

    @Value("${affluence.seuil-presque-sature:2.4}")
    private double seuilPresqueSature;

    @Value("${affluence.declaration-distance-max-meters:500}")
    private double distanceMaxMetres;

    // =========================================================================
    // DÉPENDANCES
    // =========================================================================
    private final DeclarationAffluenceRepository declarationAffluenceRepository;
    private final EspacePublicRepository espacePublicRepository;
    private final UtilisateurService utilisateurService;
    private final JournalService journalService;
    private final GeoDistanceService geoDistanceService;

    // =========================================================================
    // DÉCLARATION D'AFFLUENCE (existant, inchangé)
    // =========================================================================
    @Override
    @Transactional
    public void declarer(Long espaceId, DeclarationAffluenceRequest request) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        EspacePublic espace = espacePublicRepository.findById(espaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        if (!Boolean.TRUE.equals(espace.getEstValide())) {
            throw new BusinessException("Cet espace public n'est pas validé");
        }

        double distance = geoDistanceService.calculateDistanceInMeters(
                request.getLatitude(), request.getLongitude(),
                espace.getLatitude(), espace.getLongitude()
        );

        if (distance > distanceMaxMetres) {
            throw new BusinessException("Vous êtes trop éloigné de cet espace public pour déclarer son affluence");
        }

        DeclarationAffluence declaration = DeclarationAffluence.builder()
                .espacePublic(espace)
                .utilisateur(utilisateur)
                .statutAffluence(request.getStatutAffluence())
                .build();

        declarationAffluenceRepository.save(declaration);

        // Recalcul complet avec la nouvelle déclaration
        StatutAffluence nouveauStatut = calculerStatutAffluence(espace);
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

    // =========================================================================
    // OBTENTION DU STATUT ACTUEL — CORRIGÉ : lecture seule, pas de persistance
    // =========================================================================
    @Override
    @Transactional(readOnly = true)
    public StatutAffluence getStatutActuel(Long espaceId) {
        EspacePublic espace = espacePublicRepository.findById(espaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Espace public introuvable"));

        return calculerStatutAffluence(espace);
    }

    // =========================================================================
    // ALGORITHME PRINCIPAL : CALCUL DU STATUT D'AFFLUENCE (inchangé)
    // =========================================================================
    private StatutAffluence calculerStatutAffluence(EspacePublic espace) {
        LocalDateTime maintenant = LocalDateTime.now();

        // --- 1. Score récent (déclarations des X dernières minutes) ---
        double scoreRecent = calculerScoreRecent(espace, maintenant);
        boolean aDesDonneesRecentes = scoreRecent > 0;

        // --- 2. Score historique (profil temporel jour + heure) ---
        double scoreHistorique = calculerScoreHistorique(espace, maintenant);
        boolean aDesDonneesHistoriques = scoreHistorique > 0;

        // --- 3. Combinaison pondérée ---
        double scoreFinal;

        if (aDesDonneesRecentes && aDesDonneesHistoriques) {
            scoreFinal = (scoreRecent * poidsRecent) + (scoreHistorique * poidsHistorique);
        } else if (aDesDonneesRecentes) {
            scoreFinal = scoreRecent;
        } else if (aDesDonneesHistoriques) {
            scoreFinal = scoreHistorique;
        } else {
            return StatutAffluence.INCONNU;
        }

        return determinerStatutDepuisScore(scoreFinal);
    }

    // =========================================================================
    // SCORE RÉCENT : pondération temporelle décroissante (inchangé)
    // =========================================================================
    private double calculerScoreRecent(EspacePublic espace, LocalDateTime reference) {
        LocalDateTime limite = reference.minusMinutes(fenetreRecenteMinutes);

        List<DeclarationAffluence> declarations = declarationAffluenceRepository
                .findByEspacePublicAndDateDeclarationAfter(espace, limite);

        if (declarations.isEmpty()) {
            return 0.0;
        }

        double sommePonderee = 0.0;
        double sommePoids = 0.0;

        for (DeclarationAffluence d : declarations) {
            long minutesEcoulees = ChronoUnit.MINUTES.between(d.getDateDeclaration(), reference);
            if (minutesEcoulees < 0) minutesEcoulees = 0;
            if (minutesEcoulees > fenetreRecenteMinutes) minutesEcoulees = fenetreRecenteMinutes;

            double poids = 1.0 - (0.9 * minutesEcoulees / fenetreRecenteMinutes);
            double valeur = valeurNumerique(d.getStatutAffluence());

            sommePonderee += valeur * poids;
            sommePoids += poids;
        }

        return sommePonderee / sommePoids;
    }

    // =========================================================================
    // SCORE HISTORIQUE : CORRIGÉ — gestion correcte de la fenêtre autour de minuit
    // =========================================================================
    private double calculerScoreHistorique(EspacePublic espace, LocalDateTime reference) {
        // Période historique : des 3 derniers mois jusqu'à hier
        LocalDateTime debutPeriode = reference.minusDays(profondeurHistoriqueJours).with(LocalTime.MIN);
        LocalDateTime finPeriode = reference.minusDays(1).with(LocalTime.MAX);

        // Jour de la semaine actuel (1=Lundi, ..., 7=Dimanche)
        int jourActuel = reference.getDayOfWeek().getValue();

        // Récupération de toutes les déclarations historiques de l'espace
        List<DeclarationAffluence> declarationsHistoriques = declarationAffluenceRepository
                .findByEspacePublicAndDateDeclarationBetween(espace, debutPeriode, finPeriode);

        if (declarationsHistoriques.isEmpty()) {
            return 0.0;
        }

        double sommePonderee = 0.0;
        double sommePoids = 0.0;

        for (DeclarationAffluence d : declarationsHistoriques) {
            LocalDateTime dateDecl = d.getDateDeclaration();

            // --- Filtrage par jour de la semaine ---
            if (dateDecl.getDayOfWeek().getValue() != jourActuel) {
                continue;
            }

            // --- Filtrage par fenêtre horaire (CORRECTION MINUIT) ---
            // On calcule la distance en minutes entre l'heure de la déclaration
            // et l'heure actuelle, en gérant correctement le passage par minuit.
            // Exemple : 23:55 et 00:10 → distance = 15 minutes (pas 23h45)
            long deltaMinutes = deltaMinutesAutourMinuit(
                    dateDecl.toLocalTime(),
                    reference.toLocalTime()
            );

            // La moitié de la fenêtre historique constitue la tolérance max
            long demiFenetre = fenetreHistoriqueMinutes / 2;

            if (deltaMinutes > demiFenetre) {
                continue; // Hors de la fenêtre horaire autorisée
            }

            // --- Pondération selon l'ancienneté dans l'historique ---
            long joursEcoules = ChronoUnit.DAYS.between(dateDecl.toLocalDate(), reference.toLocalDate());
            double poidsHistorique;
            if (joursEcoules <= 30) {
                poidsHistorique = 1.0;
            } else {
                poidsHistorique = Math.max(0.3, 1.0 - (0.7 * (joursEcoules - 30) / (profondeurHistoriqueJours - 30)));
            }

            double valeur = valeurNumerique(d.getStatutAffluence());

            sommePonderee += valeur * poidsHistorique;
            sommePoids += poidsHistorique;
        }

        if (sommePoids == 0.0) {
            return 0.0;
        }

        return sommePonderee / sommePoids;
    }

    // =========================================================================
    // UTILITAIRE : distance circulaire entre deux LocalTime (gestion minuit)
    // =========================================================================
    /**
     * Calcule la distance minimale en minutes entre deux heures,
     * en considérant l'horloge comme circulaire (24h = 0h).
     *
     * Exemples :
     * - 10:00 et 10:15 → 15 minutes
     * - 23:55 et 00:10 → 15 minutes (traverse minuit)
     * - 00:05 et 23:50 → 15 minutes (traverse minuit en sens inverse)
     * - 14:00 et 14:45 → 45 minutes
     *
     * @param heure1 Première heure
     * @param heure2 Deuxième heure
     * @return Distance en minutes (toujours positive, entre 0 et 720)
     */
    private long deltaMinutesAutourMinuit(LocalTime heure1, LocalTime heure2) {
        long minutes1 = heure1.toSecondOfDay() / 60L;
        long minutes2 = heure2.toSecondOfDay() / 60L;

        long diffDirecte = Math.abs(minutes1 - minutes2);
        long diffCirculaire = 24L * 60L - diffDirecte;

        return Math.min(diffDirecte, diffCirculaire);
    }

    // =========================================================================
    // MAPPING SCORE → STATUT (inchangé)
    // =========================================================================
    private StatutAffluence determinerStatutDepuisScore(double score) {
        if (score <= seuilDisponible) {
            return StatutAffluence.DISPONIBLE;
        } else if (score <= seuilPresqueSature) {
            return StatutAffluence.PRESQUE_SATURE;
        } else {
            return StatutAffluence.SATURE;
        }
    }

    // =========================================================================
    // UTILITAIRE : valeur numérique d'un statut (inchangé)
    // =========================================================================
    private double valeurNumerique(StatutAffluence statut) {
        return switch (statut) {
            case DISPONIBLE -> VALEUR_DISPONIBLE;
            case PRESQUE_SATURE -> VALEUR_PRESQUE_SATURE;
            case SATURE -> VALEUR_SATURE;
            case INCONNU -> 0.0;
        };
    }
}