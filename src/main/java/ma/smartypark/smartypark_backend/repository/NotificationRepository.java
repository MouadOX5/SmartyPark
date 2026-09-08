package ma.smartypark.smartypark_backend.repository;

import ma.smartypark.smartypark_backend.entity.Notification;
import ma.smartypark.smartypark_backend.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByDestinataireOrderByDateCreationDesc(Utilisateur destinataire);

    long countByDestinataireAndEstLueFalse(Utilisateur destinataire);
}
