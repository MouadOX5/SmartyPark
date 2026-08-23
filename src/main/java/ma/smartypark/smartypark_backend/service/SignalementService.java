package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.signalement.SignalementRequest;
import ma.smartypark.smartypark_backend.dto.signalement.SignalementResponse;
import ma.smartypark.smartypark_backend.entity.StatutSignalement;
import ma.smartypark.smartypark_backend.entity.TypeSignalement;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;


import java.util.List;

public interface SignalementService {

    SignalementResponse creer(SignalementRequest request,
                              MultipartFile photo
    );

    SignalementResponse findById(Long id);

    List<SignalementResponse> findEnAttente();

    List<SignalementResponse> findByType(TypeSignalement type);

    List<SignalementResponse> findByEspace(Long espacePublicId);

    SignalementResponse traiter(Long id, StatutSignalement nouveauStatut, String commentaireModerateur);

    Resource getPhoto(Long signalementId);



}