package ma.smartypark.smartypark_backend.service.impl;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.signalement.SignalementRequest;
import ma.smartypark.smartypark_backend.dto.signalement.SignalementResponse;
import ma.smartypark.smartypark_backend.entity.*;
import ma.smartypark.smartypark_backend.mapper.SignalementMapper;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.repository.SignalementRepository;
import ma.smartypark.smartypark_backend.service.FileStorageService;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.NotificationService;
import ma.smartypark.smartypark_backend.service.SignalementService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;



import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class  SignalementServiceImpl implements SignalementService {

    private final SignalementRepository signalementRepository;
    private final EspacePublicRepository espacePublicRepository;
    private final SignalementMapper signalementMapper;
    private final UtilisateurService utilisateurService;
    private final JournalService journalService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public SignalementResponse creer(SignalementRequest request,
                                     MultipartFile photo
    ) {

        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        EspacePublic espace = espacePublicRepository.findById(request.getEspacePublicId())
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        if (!espace.getEstValide()) {
            throw new BusinessException("Cet espace public n'est pas validé");
        }

        Signalement signalement = signalementMapper.toEntity(request);

        signalement.setSignalePark(utilisateur);

        signalement.setEspacePublic(espace);

        signalement.setStatut(StatutSignalement.EN_ATTENTE);

// Photo facultative
        if (photo != null && !photo.isEmpty()) {

            String photoPath =
                    fileStorageService.storeSignalementPhoto(photo);

            signalement.setPhotoPath(photoPath);
        }


        Signalement signalementCree =
                signalementRepository.save(signalement);

        journalService.log(
                "CREATION_SIGNALEMENT",
                "Création du signalement ID : "
                        + signalementCree.getId()
                        + ", type : "
                        + signalementCree.getType()
                        + ", espace public ID : "
                        + espace.getId()
        );

        return signalementMapper.toResponse(signalementCree);
    }

    @Override
    public SignalementResponse findById(Long id) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement introuvable"));
        return signalementMapper.toResponse(signalement);
    }

    @Override
    public List<SignalementResponse> findEnAttente() {
        return signalementRepository.findByStatut(StatutSignalement.EN_ATTENTE).stream()
                .map(signalementMapper::toResponse)
                .toList();
    }

    @Override
    public List<SignalementResponse> findByType(TypeSignalement type) {
        return signalementRepository.findByType(type).stream()
                .map(signalementMapper::toResponse)
                .toList();
    }

    @Override
    public List<SignalementResponse> findByEspace(Long espacePublicId) {
        EspacePublic espace = espacePublicRepository.findById(espacePublicId)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        return signalementRepository.findByEspacePublic(espace).stream()
                .map(signalementMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SignalementResponse traiter(Long id, StatutSignalement nouveauStatut, String commentaireModerateur) {
        Signalement signalement = signalementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement introuvable"));

        if (signalement.getStatut() != StatutSignalement.EN_ATTENTE) {
            throw new BusinessException("Ce signalement a déjà été traité");
        }

        if (nouveauStatut != StatutSignalement.TRAITE
                && nouveauStatut != StatutSignalement.REJETE) {

            throw new BusinessException(
                    "Le statut doit être TRAITE ou REJETE");
        }

        signalement.setStatut(nouveauStatut);
        signalement.setCommentaireModerateur(commentaireModerateur);

        Signalement signalementTraite = signalementRepository.save(signalement);

        String action = nouveauStatut == StatutSignalement.TRAITE
                ? "TRAITEMENT_SIGNALEMENT"
                : "REJET_SIGNALEMENT";

        String details =
                "Signalement ID : " + signalementTraite.getId()
                        + ", type : " + signalementTraite.getType()
                        + ", espace public ID : "
                        + signalementTraite.getEspacePublic().getId()
                        + ", statut : " + signalementTraite.getStatut()
                        + ", commentaire : " + commentaireModerateur;

        journalService.log(action, details);

        TypeNotification typeNotif = nouveauStatut == StatutSignalement.TRAITE
                ? TypeNotification.SIGNALEMENT_TRAITE
                : TypeNotification.SIGNALEMENT_REJETE;

        String titreNotif = nouveauStatut == StatutSignalement.TRAITE
                ? "Votre signalement a été traité"
                : "Votre signalement a été rejeté";

        notificationService.creer(
                signalementTraite.getSignalePark(),
                typeNotif,
                titreNotif,
                "Concernant votre signalement sur \"" + signalementTraite.getEspacePublic().getNom()
                        + "\" : " + commentaireModerateur,
                signalementTraite.getId()
        );

        return signalementMapper.toResponse(signalementTraite);

    }

    @Override
    public Resource getPhoto(Long signalementId) {
        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new ResourceNotFoundException("Signalement introuvable"));

        if (signalement.getPhotoPath() == null || signalement.getPhotoPath().isBlank()) {
            throw new ResourceNotFoundException("Aucune photo n'est associée à ce signalement");
        }

        return fileStorageService.loadSignalementPhoto(signalement.getPhotoPath());
    }

}