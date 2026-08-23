package ma.smartypark.smartypark_backend.dto.presence;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PresenceRequest {

    @NotNull(message = "L'identifiant de l'espace public est obligatoire")
    private Long espacePublicId;
}