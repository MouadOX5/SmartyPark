package ma.smartypark.smartypark_backend.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ma.smartypark.smartypark_backend.entity.TypeNotification;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private TypeNotification type;
    private String titre;
    private String message;
    private Boolean estLue;
    private Long referenceId;
    private LocalDateTime dateCreation;
}
