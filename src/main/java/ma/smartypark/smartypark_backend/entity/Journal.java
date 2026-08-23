package ma.smartypark.smartypark_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "journaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'acteur est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "acteur_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Utilisateur acteur;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateAction;

    @NotBlank(message = "L'action est obligatoire")
    @Column(nullable = false, length = 255)
    private String action;

    @Column(length = 2000)
    private String details;

    @PrePersist
    protected void onCreate() {
        this.dateAction = LocalDateTime.now();
    }
}