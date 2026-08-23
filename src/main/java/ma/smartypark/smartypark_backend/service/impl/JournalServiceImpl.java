package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.journal.JournalResponse;
import ma.smartypark.smartypark_backend.entity.Journal;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.mapper.JournalMapper;
import ma.smartypark.smartypark_backend.repository.JournalRepository;
import ma.smartypark.smartypark_backend.repository.UtilisateurRepository;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JournalServiceImpl implements JournalService {

    private final JournalRepository journalRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final JournalMapper journalMapper;

    @Override
    @Transactional
    public void log(String action, String details) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        // Cas 1 : Action faite par le Serveur / Tâche planifiée (@Scheduled)
        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            // On n'interrompt pas l'application avec une Exception !
            // On enregistre l'action sous l'identité du Système.
            logSysteme(action, details);
            return;
        }

        // Cas 2 : Action faite par un humain connecté (Admin, Modérateur, Mobile)
        String email = authentication.getName();

        Utilisateur acteur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Utilisateur authentifié introuvable"
                        )
                );

        log(acteur, action, details);
    }
    @Override
    @Transactional
    public void log(
            Utilisateur acteur,
            String action,
            String details) {

        Journal journal = Journal.builder()
                .acteur(acteur)
                .action(action)
                .details(details)
                .build();

        journalRepository.save(journal);
    }

    private void logSysteme(String action, String details) {
        // On récupère le compte utilisateur technique "system@smartypark.ma" créé en BDD
        Utilisateur systemUser = utilisateurRepository.findByEmail("system@smartypark.ma")
                .orElseThrow(() -> new ResourceNotFoundException("Compte système introuvable"));

        Journal logEntry = Journal.builder()
                .action(action)
                .details(details)
                .acteur(systemUser) // On associe l'utilisateur SYSTEM
                .dateAction(LocalDateTime.now())
                .build();

        journalRepository.save(logEntry);
    }

    @Override
    public List<JournalResponse> findAll() {
        return journalRepository.findAll().stream()
                .map(journalMapper::toResponse)
                .toList();
    }

    @Override
    public List<JournalResponse> findByActeur(Long acteurId) {
        Utilisateur acteur = utilisateurRepository.findById(acteurId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Acteur introuvable"));

        return journalRepository.findByActeur(acteur).stream()
                .map(journalMapper::toResponse)
                .toList();
    }

    @Override
    public List<JournalResponse> findByPeriode(
            LocalDateTime debut,
            LocalDateTime fin) {

        return journalRepository
                .findByDateActionBetween(debut, fin)
                .stream()
                .map(journalMapper::toResponse)
                .toList();
    }

    @Override
    public List<JournalResponse> findByAction(String action) {
        return journalRepository
                .findByActionContainingIgnoreCase(action)
                .stream()
                .map(journalMapper::toResponse)
                .toList();
    }

    @Override
    public List<JournalResponse> findByActeurAndPeriode(
            Long acteurId,
            LocalDateTime debut,
            LocalDateTime fin) {

        Utilisateur acteur = utilisateurRepository.findById(acteurId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Acteur introuvable"));

        return journalRepository
                .findByActeurAndDateActionBetween(
                        acteur,
                        debut,
                        fin
                )
                .stream()
                .map(journalMapper::toResponse)
                .toList();
    }
}