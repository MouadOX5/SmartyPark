package ma.smartypark.smartypark_backend.service.impl;

import ma.smartypark.smartypark_backend.exception.BusinessException;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

/**
 * Stockage des images (espaces publics et signalements) sur Supabase Storage,
 * via son API REST S3-compatible, plutôt que sur le disque local.
 *
 * - Bucket "espaces" (public) : les photos d'espaces publics doivent être
 *   chargeables directement par <Image> côté mobile, sans authentification.
 * - Bucket "signalements" (privé) : les photos ne sont accessibles qu'en
 *   passant par le backend (voir SignalementController -> getPhoto),
 *   lui-même protégé par @PreAuthorize MODERATEUR/ADMINISTRATEUR. Le backend
 *   utilise la clé service_role pour lire le fichier, jamais exposée au client.
 */
@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final String ESPACES_BUCKET = "espaces";
    private static final String SIGNALEMENTS_BUCKET = "signalements";

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_EXTENSIONS = List.of(".jpg", ".jpeg", ".png", ".webp");

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.service-key}")
    private String supabaseServiceKey;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    // ============================================================
    // SIGNALEMENTS (bucket privé)
    // ============================================================
    @Override
    public String storeSignalementPhoto(MultipartFile file) {
        validateImageFile(file);
        return uploadToSupabase(file, SIGNALEMENTS_BUCKET);
    }

    @Override
    public Resource loadSignalementPhoto(String photoPath) {
        return downloadFromSupabase(photoPath, SIGNALEMENTS_BUCKET);
    }

    // ============================================================
    // ESPACES PUBLICS (bucket public)
    // ============================================================
    @Override
    public String storeEspaceImage(MultipartFile file) {
        validateImageFile(file);
        return uploadToSupabase(file, ESPACES_BUCKET);
    }

    @Override
    public Resource loadEspaceImage(String imagePath) {
        return downloadFromSupabase(imagePath, ESPACES_BUCKET);
    }

    @Override
    public void deleteEspaceImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) {
            return;
        }
        String objectKey = extractObjectKey(imagePath, ESPACES_BUCKET);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + ESPACES_BUCKET + "/" + objectKey))
                    .header("Authorization", "Bearer " + supabaseServiceKey)
                    .header("apikey", supabaseServiceKey)
                    .DELETE()
                    .build();

            httpClient.send(request, HttpResponse.BodyHandlers.discarding());
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
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

    /**
     * Upload un fichier vers Supabase Storage.
     * Retourne un chemin relatif "bucket/nomFichier.ext" — c'est ce qui est
     * stocké en base (voir EspacePublic.imageUrl / PropositionEspace.imageUrl),
     * pas l'URL complète, pour rester indépendant du projet Supabase utilisé.
     */
    private String uploadToSupabase(MultipartFile file, String bucket) {
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID() + extension;
        String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + bucket + "/" + fileName))
                    .header("Authorization", "Bearer " + supabaseServiceKey)
                    .header("apikey", supabaseServiceKey)
                    .header("Content-Type", contentType)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException("Erreur lors de l'envoi de l'image vers le stockage (code " + response.statusCode() + ")");
            }
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de l'enregistrement du fichier");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Envoi du fichier interrompu");
        }

        return bucket + "/" + fileName;
    }

    /**
     * Télécharge un fichier depuis Supabase Storage via la clé service_role
     * (fonctionne aussi bien pour un bucket privé que public).
     */
    private Resource downloadFromSupabase(String path, String defaultBucket) {
        String objectKey = extractObjectKey(path, defaultBucket);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/storage/v1/object/" + defaultBucket + "/" + objectKey))
                    .header("Authorization", "Bearer " + supabaseServiceKey)
                    .header("apikey", supabaseServiceKey)
                    .GET()
                    .build();

            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

            if (response.statusCode() == 404) {
                throw new ResourceNotFoundException("Fichier introuvable");
            }
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new BusinessException("Erreur lors de la lecture de l'image (code " + response.statusCode() + ")");
            }

            return new ByteArrayResource(response.body()) {
                @Override
                public String getFilename() {
                    return objectKey;
                }
            };
        } catch (IOException e) {
            throw new BusinessException("Erreur lors de la lecture du fichier");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BusinessException("Lecture du fichier interrompue");
        }
    }

    /**
     * Extrait le nom d'objet ("xxx.jpg") à partir d'un chemin stocké, qui peut
     * être soit "bucket/xxx.jpg" (nouveau format Supabase), soit
     * "uploads/espaces/xxx.jpg" (ancien format disque local, conservé pour
     * compatibilité avec les données déjà en base avant la migration).
     */
    private String extractObjectKey(String path, String bucket) {
        if (path == null || path.isBlank()) {
            throw new ResourceNotFoundException("Fichier introuvable");
        }
        String normalized = path.replace('\\', '/');
        int lastSlash = normalized.lastIndexOf('/');
        return lastSlash >= 0 ? normalized.substring(lastSlash + 1) : normalized;
    }
}
