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
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private final Path signalementStorageLocation;

    public FileStorageServiceImpl() {
        this.signalementStorageLocation = Paths.get("uploads/signalements").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.signalementStorageLocation);
        } catch (IOException e) {
            throw new BusinessException("Impossible de créer le dossier de stockage des photos");
        }
    }

    // ============================================================
    // EXISTANT — conservez votre implémentation actuelle
    // ============================================================
    @Override
    public String storeSignalementPhoto(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;

        Path targetLocation = this.signalementStorageLocation.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'enregistrement de la photo");
        }

        return "uploads/signalements/" + fileName;
    }

    // ============================================================
    // NOUVEAU — lecture sécurisée
    // ============================================================
    @Override
    public Resource loadSignalementPhoto(String photoPath) {
        // On extrait UNIQUEMENT le nom de fichier pour bloquer tout path traversal
        String fileName = Paths.get(photoPath).getFileName().toString();
        Path target = this.signalementStorageLocation.resolve(fileName).normalize();

        // Le chemin résolu doit obligatoirement rester dans le dossier autorisé
        if (!target.startsWith(this.signalementStorageLocation)) {
            throw new BusinessException("Chemin de fichier invalide");
        }

        try {
            Resource resource = new UrlResource(target.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Photo du signalement introuvable");
            }
        } catch (MalformedURLException e) {
            throw new BusinessException("Chemin de fichier invalide");
        }
    }
}