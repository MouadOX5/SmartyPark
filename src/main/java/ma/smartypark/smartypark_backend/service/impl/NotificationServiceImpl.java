package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.notification.NotificationResponse;
import ma.smartypark.smartypark_backend.entity.Notification;
import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.entity.TypeNotification;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.mapper.NotificationMapper;
import ma.smartypark.smartypark_backend.repository.NotificationRepository;
import ma.smartypark.smartypark_backend.repository.UtilisateurRepository;
import ma.smartypark.smartypark_backend.service.NotificationService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final UtilisateurService utilisateurService;
    private final UtilisateurRepository utilisateurRepository;

    @Override
    @Transactional
    public void creer(Utilisateur destinataire, TypeNotification type, String titre, String message, Long referenceId) {
        if (destinataire == null) {
            return;
        }

        Notification notification = Notification.builder()
                .destinataire(destinataire)
                .type(type)
                .titre(titre)
                .message(message)
                .referenceId(referenceId)
                .estLue(false)
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void notifierModerateurs(TypeNotification type, String titre, String message, Long referenceId) {
        List<Utilisateur> destinataires = utilisateurRepository.findByRoleIn(
                List.of(Role.MODERATEUR, Role.ADMINISTRATEUR)
        );

        List<Notification> notifications = destinataires.stream()
                .map(u -> Notification.builder()
                        .destinataire(u)
                        .type(type)
                        .titre(titre)
                        .message(message)
                        .referenceId(referenceId)
                        .estLue(false)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
    }

    @Override
    public List<NotificationResponse> findByCurrentUser() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        return notificationRepository.findByDestinataireOrderByDateCreationDesc(utilisateur).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public long countNonLuesForCurrentUser() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        return notificationRepository.countByDestinataireAndEstLueFalse(utilisateur);
    }

    @Override
    @Transactional
    public NotificationResponse marquerCommeLue(Long id) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification introuvable"));

        if (!notification.getDestinataire().getId().equals(utilisateur.getId())) {
            throw new BusinessException("Cette notification ne vous appartient pas");
        }

        notification.setEstLue(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void marquerToutesCommeLues() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        List<Notification> notifications = notificationRepository.findByDestinataireOrderByDateCreationDesc(utilisateur);
        notifications.forEach(n -> n.setEstLue(true));
        notificationRepository.saveAll(notifications);
    }
}
