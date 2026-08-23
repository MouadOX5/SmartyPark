package ma.smartypark.smartypark_backend.dto.journal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalResponse {

    private Long id;
    private LocalDateTime dateAction;
    private String action;
    private String details;

    // Informations minimales de l'acteur
    private Long acteurId;
    private String acteurNom;
    private String acteurPrenom;
    private String acteurEmail;
}