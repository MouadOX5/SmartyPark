package ma.smartypark.smartypark_backend.dto.proposition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.CategorieEspace;
import ma.smartypark.smartypark_backend.entity.StatutProposition;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropositionEspaceResponse {

    private Long id;
    private String nom;
    private String description;
    private CategorieEspace categorie;
    private String adresse;
    private Float latitude;
    private Float longitude;
    private StatutProposition statut;
    private String motifRefus;
    private LocalDateTime dateProposition;

    // Informations minimales du proposant
    private Long proposeParkId;
    private String proposeParkNom;
    private String proposeParkPrenom;
}