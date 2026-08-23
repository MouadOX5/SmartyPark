package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.auth.RegisterRequest;
import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.stereotype.Component;

@Component
public class UtilisateurMapper {

    public Utilisateur toEntity(RegisterRequest request) {
        if (request == null) {
            return null;
        }

        return Utilisateur.builder()
                .nom(request.getNom())
                .prenom(request.getPrenom())
                .email(request.getEmail())
                .password(request.getPassword())
                .telephone(request.getTelephone())
                .photoProfil(request.getPhotoProfil())
                .build();
    }

    public UtilisateurResponse toResponse(Utilisateur utilisateur) {
        if (utilisateur == null) {
            return null;
        }

        return UtilisateurResponse.builder()
                .id(utilisateur.getId())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .email(utilisateur.getEmail())
                .telephone(utilisateur.getTelephone())
                .estActif(utilisateur.getEstActif())
                .role(utilisateur.getRole())
                .photoProfil(utilisateur.getPhotoProfil())
                .dateInscription(utilisateur.getDateInscription())
                .build();
    }
}