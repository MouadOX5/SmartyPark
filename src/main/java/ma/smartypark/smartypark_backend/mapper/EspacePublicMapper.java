package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.espace.EspacePublicRequest;
import ma.smartypark.smartypark_backend.dto.espace.EspacePublicResponse;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.entity.PropositionEspace;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EspacePublicMapper {

    private final ImageUrlResolver imageUrlResolver;

    public EspacePublic toEntity(EspacePublicRequest request) {
        if (request == null) {
            return null;
        }

        return EspacePublic.builder()
                .nom(request.getNom())
                .description(request.getDescription())
                .categorie(request.getCategorie())
                .adresse(request.getAdresse())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
    }

    public EspacePublicResponse toResponse(EspacePublic espacePublic) {
        if (espacePublic == null) {
            return null;
        }

        String imageUrl = imageUrlResolver.resolve(espacePublic.getImageUrl());

        return EspacePublicResponse.builder()
                .id(espacePublic.getId())
                .nom(espacePublic.getNom())
                .description(espacePublic.getDescription())
                .categorie(espacePublic.getCategorie())
                .adresse(espacePublic.getAdresse())
                .latitude(espacePublic.getLatitude())
                .longitude(espacePublic.getLongitude())
                .estValide(espacePublic.getEstValide())
                .statutAffluenceActuel(espacePublic.getStatutAffluenceActuel())
                .dateCreation(espacePublic.getDateCreation())
                .imageUrl(imageUrl)
                .build();
    }

    public EspacePublic fromPropositionValidee(PropositionEspace proposition) {
        if (proposition == null) {
            return null;
        }

        return EspacePublic.builder()
                .nom(proposition.getNom())
                .description(proposition.getDescription())
                .categorie(proposition.getCategorie())
                .adresse(proposition.getAdresse())
                .latitude(proposition.getLatitude())
                .longitude(proposition.getLongitude())
                // La photo jointe par l'utilisateur lors de la proposition (si présente)
                // devient directement la photo de l'espace public créé.
                .imageUrl(proposition.getImageUrl())
                .estValide(true)
                .build();
    }
}