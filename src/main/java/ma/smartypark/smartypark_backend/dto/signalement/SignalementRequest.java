package ma.smartypark.smartypark_backend.dto.signalement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.TypeSignalement;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignalementRequest {

    @NotNull(message = "Le type de signalement est obligatoire")
    private TypeSignalement type;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "L'identifiant de l'espace public est obligatoire")
    private Long espacePublicId;
}

