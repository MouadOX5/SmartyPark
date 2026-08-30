// ============================================================================
// File: WebConfig.java
// ============================================================================
package ma.smartypark.smartypark_backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuration pour exposer les dossiers d'uploads comme ressources statiques.
 * Permet au frontend d'accéder aux images via HTTP.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Exposition des images des espaces publics
        Path espaceUploadDir = Paths.get("uploads/espaces").toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/espaces/**")
                .addResourceLocations("file:" + espaceUploadDir + "/");

        // Exposition des photos des signalements (déjà existante, conservée)
        Path signalementUploadDir = Paths.get("uploads/signalements").toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/signalements/**")
                .addResourceLocations("file:" + signalementUploadDir + "/");
    }
}