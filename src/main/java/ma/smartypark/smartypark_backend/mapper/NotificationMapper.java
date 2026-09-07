package ma.smartypark.smartypark_backend.mapper;

import ma.smartypark.smartypark_backend.dto.notification.NotificationResponse;
import ma.smartypark.smartypark_backend.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }

        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .estLue(notification.getEstLue())
                .referenceId(notification.getReferenceId())
                .dateCreation(notification.getDateCreation())
                .build();
    }
}
