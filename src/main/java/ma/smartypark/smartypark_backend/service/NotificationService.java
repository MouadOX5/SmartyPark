package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.notification.NotificationResponse;
import ma.smartypark.smartypark_backend.entity.TypeNotification;
import ma.smartypark.smartypark_backend.entity.Utilisateur;

import java.util.List;

public interface NotificationService {

    /**
     * Crée une notification pour un utilisateur donné. Utilisé en interne par
     * les autres services (propositions, signalements) lors d'un événement
     * pertinent (validation, refus, traitement...).
     */
    void creer(Utilisateur destinataire, TypeNotification type, String titre, String message, Long referenceId);

    /**
     * Notifie tous les modérateurs et administrateurs (ex : nouvelle
     * proposition ou nouveau signalement à examiner).
     */
    void notifierModerateurs(TypeNotification type, String titre, String message, Long referenceId);

    List<NotificationResponse> findByCurrentUser();

    long countNonLuesForCurrentUser();

    NotificationResponse marquerCommeLue(Long id);

    void marquerToutesCommeLues();
}
