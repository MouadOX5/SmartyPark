package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceRequest;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceResponse;

import java.util.List;

public interface PropositionEspaceService {

    PropositionEspaceResponse creer(PropositionEspaceRequest request);

    PropositionEspaceResponse findById(Long id);

    List<PropositionEspaceResponse> findEnAttente();

    List<PropositionEspaceResponse> findByCurrentUser();

    PropositionEspaceResponse valider(Long id);

    PropositionEspaceResponse refuser(Long id, String motifRefus);
}