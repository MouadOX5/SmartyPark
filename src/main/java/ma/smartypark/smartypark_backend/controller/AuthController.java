package ma.smartypark.smartypark_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.auth.LoginRequest;
import ma.smartypark.smartypark_backend.dto.auth.RegisterRequest;
import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;
import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.mapper.UtilisateurMapper;
import ma.smartypark.smartypark_backend.service.AuthService;
import ma.smartypark.smartypark_backend.service.UtilisateurService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UtilisateurResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        UtilisateurResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(
            @Valid @RequestBody LoginRequest request) {

        String token = authService.login(request);

        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<UtilisateurResponse> getCurrentUser() {

        return ResponseEntity.ok(
                authService.getCurrentUser()
        );
    }
}