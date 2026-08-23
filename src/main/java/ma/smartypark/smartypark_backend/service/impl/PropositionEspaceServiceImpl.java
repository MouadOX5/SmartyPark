package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceRequest;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceResponse;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.entity.PropositionEspace;
import ma.smartypark.smartypark_backend.entity.StatutProposition;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.mapper.EspacePublicMapper;
import ma.smartypark.smartypark_backend.mapper.PropositionEspaceMapper;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.repository.PropositionEspaceRepository;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.service.PropositionEspaceService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Override
    @Transactional
    public PropositionEspaceResponse creer(PropositionEspaceRequest request) {
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
    public List<PropositionEspaceResponse> findByCurrentUser() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        return propositionRepository.findByProposePark(utilisateur).stream()
                .map(propositionMapper::toResponse)
                .toList();
    }

    /*--------------------------------- autre logic de validation + creation d'espace public ------------------------
    @Override
    @Transactional
    public PropositionEspaceResponse valider(Long id) {
        PropositionEspace proposition = propositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposition introuvable"));

        if (proposition.getStatut() != StatutProposition.EN_ATTENTE) {
            throw new BusinessException("Cette proposition a déjà été traitée");
        }

        // Transformation de la proposition en espace public
        EspacePublic espace =
                espacePublicMapper.fromPropositionValidee(proposition);

        // Enregistrement de l'espace public
        espacePublicRepository.save(espace);

        // Validation de la proposition
        proposition.setStatut(StatutProposition.VALIDEE);

        propositionRepository.save(proposition);

        journalService.log(
                "VALIDATION_PROPOSITION",
                "La proposition " + proposition.getId()
                        + " a été validée et transformée en espace public"
        );
                return propositionMapper.toResponse(proposition);



    }
        ------------------------------------------------------------------------------ */

    @Override
    @Transactional
    public PropositionEspaceResponse valider(Long id) {
        PropositionEspace proposition = propositionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proposition introuvable"));

        if (proposition.getStatut() != StatutProposition.EN_ATTENTE) {
            throw new BusinessException("Cette proposition a déjà été traitée");
        }

        // Mise à jour uniquement du statut
        proposition.setStatut(StatutProposition.VALIDEE);
        PropositionEspace propositionValidee = propositionRepository.save(proposition);

        journalService.log(
                "VALIDATION_PROPOSITION",
                "La proposition " + propositionValidee.getId() + " a été validée."
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

        return propositionMapper.toResponse(propositionRefusee);
    }


}