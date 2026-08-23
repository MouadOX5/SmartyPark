package ma.smartypark.smartypark_backend.dto.affluence;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.StatutAffluence;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AffluenceResponse {
    private StatutAffluence statutAffluence;
}