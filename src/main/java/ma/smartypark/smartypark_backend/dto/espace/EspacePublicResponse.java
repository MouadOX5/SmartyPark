package ma.smartypark.smartypark_backend.dto.espace;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.CategorieEspace;
import ma.smartypark.smartypark_backend.entity.StatutAffluence;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspacePublicResponse {

    private Long id;
    private String nom;
    private String description;
    private CategorieEspace categorie;
    private String adresse;
    private Float latitude;
    private Float longitude;
    private Boolean estValide;
    private StatutAffluence statutAffluenceActuel;
    private LocalDateTime dateCreation;
}