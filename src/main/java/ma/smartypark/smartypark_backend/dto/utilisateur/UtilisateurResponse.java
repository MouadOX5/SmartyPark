package ma.smartypark.smartypark_backend.dto.utilisateur;

import ma.smartypark.smartypark_backend.entity.Role;
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
public class UtilisateurResponse {

    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Boolean estActif;
    private Role role;
    private String photoProfil;
    private LocalDateTime dateInscription;
}