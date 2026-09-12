package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceRequest;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceResponse;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.entity.PropositionEspace;
import ma.smartypark.smartypark_backend.entity.StatutProposition;
import ma.smartypark.smartypark_backend.entity.TypeNotification;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.mapper.EspacePublicMapper;
import ma.smartypark.smartypark_backend.mapper.PropositionEspaceMapper;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.repository.PropositionEspaceRepository;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.NotificationService;
import ma.smartypark.smartypark_backend.service.PropositionEspaceService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.service.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PropositionEspaceServiceImpl implements PropositionEspaceService {

    private final PropositionEspaceRepository propositionRepository;
    private final PropositionEspaceMapper propositionMapper;
    private final UtilisateurService utilisateurService;
    private final EspacePublicRepository espacePublicRepository;
    private final EspacePublicMapper espacePublicMapper;
    private final JournalService journalService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public PropositionEspaceResponse creer(PropositionEspaceRequest request, MultipartFile image) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        List<StatutProposition> statuts = Arrays.asList(
                StatutProposition.EN_ATTENTE,
                StatutProposition.VALIDEE
        );

        boolean existe = propositionRepository
                .existsByNomAndAdresseAndStatutIn(
                        request.getNom(),
                        request.getAdresse(),
                        statuts

                );

        if (existe) {
            throw new BusinessException(
                    "Une proposition existe déjà pour cet espace."
            );
        }

        PropositionEspace proposition = propositionMapper.toEntity(request);
        proposition.setProposePark(utilisateur);
        proposition.setStatut(StatutProposition.EN_ATTENTE);

        if (image != null && !image.isEmpty()) {
            proposition.setImageUrl(fileStorageService.storeEspaceImage(image));
        }

        PropositionEspace saved =
                propositionRepository.save(proposition);


        journalService.log(
                "CREATION_PROPOSITION",
                "Création de la proposition ID : "
                        + saved.getId()
                        + ", nom : "
                        + saved.getNom()
                        + ", adresse : "
                        + saved.getAdresse()
        );

        notificationService.notifierModerateurs(
                TypeNotification.NOUVELLE_PROPOSITION,
                "Nouvelle proposition à examiner",
                utilisateur.getPrenom() + " " + utilisateur.getNom()
                        + " a proposé l'espace \"" + saved.getNom() + "\".",
                saved.getId()
        );

        return propositionMapper.toResponse(saved);

    }

    @Override
    public PropositionEspaceResponse findById(Long id) {
        PropositionEspace proposition = propositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposition introuvable"));
        return propositionMapper.toResponse(proposition);
    }

    @Override
    public List<PropositionEspaceResponse> findEnAttente() {
        return propositionRepository.findByStatut(StatutProposition.EN_ATTENTE).stream()
                .map(propositionMapper::toResponse)
                .toList();
    }

    @Override
    public List<PropositionEspaceResponse> findHistorique() {
        return propositionRepository.findAllByOrderByDatePropositionDesc().stream()
                .map(propositionMapper::toResponse)
                .toList();
    }

    @Override
    public List<PropositionEspaceResponse> findByCurrentUser() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        return propositionRepository.findByProposePark(utilisateur).stream()
                .map(propositionMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PropositionEspaceResponse valider(Long id) {
        PropositionEspace proposition = propositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposition introuvable"));

        if (proposition.getStatut() != StatutProposition.EN_ATTENTE) {
            throw new BusinessException("Cette proposition a déjà été traitée");
        }

        // Transformation de la proposition en espace public (photo incluse)
        EspacePublic espace = espacePublicMapper.fromPropositionValidee(proposition);
        espacePublicRepository.save(espace);

        proposition.setStatut(StatutProposition.VALIDEE);
        PropositionEspace propositionValidee = propositionRepository.save(proposition);

        journalService.log(
                "VALIDATION_PROPOSITION",
                "La proposition " + propositionValidee.getId()
                        + " a été validée et transformée en espace public (ID : " + espace.getId() + ")"
        );

        notificationService.creer(
                propositionValidee.getProposePark(),
                TypeNotification.PROPOSITION_VALIDEE,
                "Votre proposition a été validée ! 🎉",
                "Votre proposition \"" + propositionValidee.getNom() + "\" a été validée et est maintenant visible par tous les utilisateurs.",
                espace.getId()
        );

        return propositionMapper.toResponse(propositionValidee);
    }

    @Override
    @Transactional
    public PropositionEspaceResponse refuser(Long id, String motifRefus) {
        PropositionEspace proposition = propositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposition introuvable"));

        if (proposition.getStatut() != StatutProposition.EN_ATTENTE) {
            throw new BusinessException("Cette proposition a déjà été traitée");
        }

        proposition.setStatut(StatutProposition.REJETEE);
        proposition.setMotifRefus(motifRefus);

        PropositionEspace propositionRefusee =
                propositionRepository.save(proposition);

        journalService.log(
                "REJET_PROPOSITION",
                "La proposition " + propositionRefusee.getId()
                        + " a été rejetée."
                        + " Motif : " + motifRefus
        );

        notificationService.creer(
                propositionRefusee.getProposePark(),
                TypeNotification.PROPOSITION_REJETEE,
                "Votre proposition a été refusée",
                "Votre proposition \"" + propositionRefusee.getNom() + "\" a été refusée. Motif : " + motifRefus,
                propositionRefusee.getId()
        );

        return propositionMapper.toResponse(propositionRefusee);
    }


}