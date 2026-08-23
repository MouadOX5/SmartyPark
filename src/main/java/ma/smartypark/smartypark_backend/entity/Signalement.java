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
@Table(name = "signalements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Le type de signalement est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeSignalement type;

    @NotBlank(message = "La description est obligatoire")
    @Column(nullable = false, length = 1000)
    private String description;

    @Column(length = 1000)
    private String commentaireModerateur;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutSignalement statut = StatutSignalement.EN_ATTENTE;

    @NotNull(message = "L'utilisateur est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Utilisateur signalePark;

    @NotNull(message = "L'espace public est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "espace_public_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private EspacePublic espacePublic;

    @Column(length = 500)
    private String photoPath;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutSignalement.EN_ATTENTE;
        }
    }
}