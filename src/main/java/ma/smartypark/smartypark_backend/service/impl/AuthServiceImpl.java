package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.config.JwtTokenProvider;
import ma.smartypark.smartypark_backend.dto.auth.LoginRequest;
import ma.smartypark.smartypark_backend.dto.auth.RegisterRequest;
import ma.smartypark.smartypark_backend.dto.utilisateur.UtilisateurResponse;
import ma.smartypark.smartypark_backend.entity.Role;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import ma.smartypark.smartypark_backend.mapper.UtilisateurMapper;
import ma.smartypark.smartypark_backend.repository.UtilisateurRepository;
import ma.smartypark.smartypark_backend.service.AuthService;
import ma.smartypark.smartypark_backend.service.JournalService;
import ma.smartypark.smartypark_backend.exception.BusinessException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final UtilisateurMapper utilisateurMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final JournalService journalService;

    @Override
    @Transactional
    public UtilisateurResponse register(RegisterRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Cet email est déjà utilisé");
        }

        Utilisateur utilisateur = utilisateurMapper.toEntity(request);
        utilisateur.setPassword(passwordEncoder.encode(request.getPassword()));
        utilisateur.setRole(Role.MOBILE_USER);
        utilisateur.setEstActif(true);

        Utilisateur saved = utilisateurRepository.save(utilisateur);

        journalService.log(
                saved,
                "INSCRIPTION",
                "Nouvel utilisateur inscrit : "
                        + saved.getEmail()
                        + " (ID : "
                        + saved.getId()
                        + ")"
        );

        return utilisateurMapper.toResponse(saved);
    }

    @Override
    public String login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        journalService.log(
                "CONNEXION",
                "Utilisateur connecté : " + request.getEmail()
        );

        return jwtTokenProvider.generateToken(authentication);
    }

    @Override
    public UtilisateurResponse getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Utilisateur authentifié introuvable"));

        return utilisateurMapper.toResponse(utilisateur);
    }
}