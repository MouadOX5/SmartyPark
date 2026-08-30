package ma.smartypark.smartypark_backend.service.impl;

import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.service.FileStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path signalementStorageLocation;
    private final Path espaceStorageLocation;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp");

    public FileStorageServiceImpl() {
        this.signalementStorageLocation = Paths.get("uploads/signalements").toAbsolutePath().normalize();
        this.espaceStorageLocation = Paths.get("uploads/espaces").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.signalementStorageLocation);
            Files.createDirectories(this.espaceStorageLocation);
        } catch (IOException e) {
            throw new BusinessException("Impossible de créer le dossier de stockage des images");
        }
    }

    // ============================================================
    // SIGNALEMENTS — EXISTANT
    // ============================================================
    @Override
    public String storeSignalementPhoto(MultipartFile file) {
        return storeFile(file, this.signalementStorageLocation, "uploads/signalements/");
    }

    @Override
    public Resource loadSignalementPhoto(String photoPath) {
        return loadFile(photoPath, this.signalementStorageLocation);
    }

    // ============================================================
    // ESPACES PUBLICS — NOUVEAU
    // ============================================================
    @Override
    public String storeEspaceImage(MultipartFile file) {
        validateImageFile(file);
        return storeFile(file, this.espaceStorageLocation, "uploads/espaces/");
    }

    @Override
    public Resource loadEspaceImage(String imagePath) {
        return loadFile(imagePath, this.espaceStorageLocation);
    }

    @Override
    public void deleteEspaceImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return;
        }
        String fileName = Paths.get(imagePath).getFileName().toString();
        Path target = this.espaceStorageLocation.resolve(fileName).normalize();

        if (!target.startsWith(this.espaceStorageLocation)) {
            throw new BusinessException("Chemin de fichier invalide");
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de la suppression de l'image");
        }
    }

    // ============================================================
    // MÉTHODES PRIVÉES RÉUTILISABLES
    // ============================================================
    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Le fichier image est vide");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException(
                    "Type de fichier non supporté. Formats acceptés : JPEG, PNG, WEBP"
            );
        }

        // Vérification de l'extension
        String originalName = file.getOriginalFilename();
        if (originalName != null) {
            String lowerName = originalName.toLowerCase();
            boolean validExt = ALLOWED_EXTENSIONS.stream().anyMatch(lowerName::endsWith);
            if (!validExt) {
                throw new BusinessException(
                        "Extension de fichier non supportée. Formats acceptés : .jpg, .jpeg, .png, .webp"
                );
            }
        }
    }

    private String storeFile(MultipartFile file, Path storageLocation, String relativePrefix) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        Path targetLocation = storageLocation.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'enregistrement du fichier");
        }

        return relativePrefix + fileName;
    }

    private Resource loadFile(String filePath, Path storageLocation) {
        String fileName = Paths.get(filePath).getFileName().toString();
        Path target = storageLocation.resolve(fileName).normalize();

        if (!target.startsWith(storageLocation)) {
            throw new BusinessException("Chemin de fichier invalide");
        }

        try {
            Resource resource = new UrlResource(target.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Fichier introuvable");
            }
        } catch (MalformedURLException e) {
            throw new BusinessException("Chemin de fichier invalide");
        }
    }
}