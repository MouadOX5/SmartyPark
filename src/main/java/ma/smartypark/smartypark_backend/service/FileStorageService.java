// ============================================================================
// File: FileStorageService.java
// ============================================================================
package ma.smartypark.smartypark_backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    // EXISTANT — ne pas modifier
    String storeSignalementPhoto(MultipartFile file);

    // NOUVEAU — lecture sécurisée signalement
    Resource loadSignalementPhoto(String photoPath);

    // NOUVEAU — stockage image espace public
    String storeEspaceImage(MultipartFile file);

    // NOUVEAU — lecture sécurisée image espace public
    Resource loadEspaceImage(String imagePath);

    // NOUVEAU — suppression image espace public
    void deleteEspaceImage(String imagePath);
}