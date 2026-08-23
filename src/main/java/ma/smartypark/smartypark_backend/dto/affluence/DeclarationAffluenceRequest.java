package ma.smartypark.smartypark_backend.dto.affluence;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.StatutAffluence;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeclarationAffluenceRequest {

    @NotNull(message = "Le statut d'affluence est obligatoire")
    private StatutAffluence statutAffluence;

    @NotNull(message = "La latitude est obligatoire")
    @Min(value = -90, message = "La latitude doit être comprise entre -90 et 90")
    @Max(value = 90, message = "La latitude doit être comprise entre -90 et 90")
    private Float latitude;

    @NotNull(message = "La longitude est obligatoire")
    @Min(value = -180, message = "La longitude doit être comprise entre -180 et 180")
    @Max(value = 180, message = "La longitude doit être comprise entre -180 et 180")
    private Float longitude;
}