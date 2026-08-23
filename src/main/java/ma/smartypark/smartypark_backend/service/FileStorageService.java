package ma.smartypark.smartypark_backend.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    // EXISTANT — ne pas modifier
    String storeSignalementPhoto(MultipartFile file);

    // NOUVEAU
    Resource loadSignalementPhoto(String photoPath);
}