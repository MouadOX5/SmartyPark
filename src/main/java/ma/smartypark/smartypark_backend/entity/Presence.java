package ma.smartypark.smartypark_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "presences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Presence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false)
    private LocalDateTime heureArrivee;

    private LocalDateTime heureDepart;

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutPresence statut = StatutPresence.ACTIVE;

    @NotNull(message = "L'utilisateur est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Utilisateur utilisateur;

    @NotNull(message = "L'espace public est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "espace_public_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private EspacePublic espacePublic;


    @PrePersist
    protected void onCreate() {
        if (this.heureArrivee == null) {
            this.heureArrivee = LocalDateTime.now();
        }

        if (this.statut == null) {
            this.statut = StatutPresence.ACTIVE;
        }
    }
}