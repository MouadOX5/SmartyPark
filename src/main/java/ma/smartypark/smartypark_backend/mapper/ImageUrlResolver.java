package ma.smartypark.smartypark_backend.mapper;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Construit l'URL publique complète d'une image d'espace public à partir du
 * chemin relatif stocké en base, en supportant deux formats (transition vers
 * Supabase Storage) :
 * - "espaces/xxx.jpg"        -> nouveau format (Supabase Storage, bucket public)
 * - "uploads/espaces/xxx.jpg" -> ancien format (fichiers servis localement,
 *                                 conservé pour compatibilité avec les
 *                                 données créées avant la migration)
 */
@Component
public class ImageUrlResolver {

    @Value("${app.base-url:http://localhost:8080}")
    private String appBaseUrl;

    @Value("${supabase.url:}")
    private String supabaseUrl;

    public String resolve(String storedPath) {
        if (storedPath == null || storedPath.isBlank() || storedPath.startsWith("http")) {
            return storedPath;
        }

        if (storedPath.startsWith("uploads/")) {
            // Ancien format : fichier servi localement par le backend
            return appBaseUrl + "/" + storedPath;
        }

        // Nouveau format : "espaces/xxx.jpg" -> objet public Supabase Storage
        return supabaseUrl + "/storage/v1/object/public/" + storedPath;
    }
}
