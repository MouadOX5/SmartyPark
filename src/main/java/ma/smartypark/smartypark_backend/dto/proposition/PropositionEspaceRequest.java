package ma.smartypark.smartypark_backend.dto.proposition;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.CategorieEspace;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropositionEspaceRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    private CategorieEspace categorie;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    @NotNull(message = "La latitude est obligatoire")
    @Min(value = -90, message = "La latitude doit être comprise entre -90 et 90")
    @Max(value = 90, message = "La latitude doit être comprise entre -90 et 90")
    private Float latitude;

    @NotNull(message = "La longitude est obligatoire")
    @Min(value = -180, message = "La longitude doit être comprise entre -180 et 180")
    @Max(value = 180, message = "La longitude doit être comprise entre -180 et 180")
    private Float longitude;
}