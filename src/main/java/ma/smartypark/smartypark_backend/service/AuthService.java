package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.auth.LoginRequest;
import ma.smartypark.smartypark_backend.dto.auth.RegisterRequest;
import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;

public interface AuthService {

    UtilisateurResponse register(RegisterRequest request);

    String login(LoginRequest request);

    UtilisateurResponse getCurrentUser();
}