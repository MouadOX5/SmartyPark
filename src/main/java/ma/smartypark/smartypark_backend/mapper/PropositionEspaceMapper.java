package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceRequest;
import ma.smartypark.smartypark_backend.dto.proposition.PropositionEspaceResponse;
import ma.smartypark.smartypark_backend.entity.PropositionEspace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PropositionEspaceMapper {

    private final ImageUrlResolver imageUrlResolver;

    public PropositionEspace toEntity(PropositionEspaceRequest request) {
        if (request == null) {
            return null;
        }

        return PropositionEspace.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .categorie(request.getCategorie())
                .adresse(request.getAdresse())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
    }

    public PropositionEspaceResponse toResponse(PropositionEspace proposition) {
        if (proposition == null) {
            return null;
        }

        Long proposeParkId = null;
        String proposeParkNom = null;
        String proposeParkPrenom = null;

        if (proposition.getProposePark() != null) {
            proposeParkId = proposition.getProposePark().getId();
            proposeParkNom = proposition.getProposePark().getNom();
            proposeParkPrenom = proposition.getProposePark().getPrenom();
        }

        String imageUrl = imageUrlResolver.resolve(proposition.getImageUrl());

        return PropositionEspaceResponse.builder()
                .id(proposition.getId())
                .nom(proposition.getNom())
                .description(proposition.getDescription())
                .categorie(proposition.getCategorie())
                .adresse(proposition.getAdresse())
                .latitude(proposition.getLatitude())
                .longitude(proposition.getLongitude())
                .statut(proposition.getStatut())
                .motifRefus(proposition.getMotifRefus())
                .dateProposition(proposition.getDateProposition())
                .imageUrl(imageUrl)
                .proposeParkId(proposeParkId)
                .proposeParkNom(proposeParkNom)
                .proposeParkPrenom(proposeParkPrenom)
                .build();
    }
}