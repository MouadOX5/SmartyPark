package ma.smartypark.smartypark_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "propositions_espace",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_proposition_nom_adresse",
                        columnNames = {"nom", "adresse"}
                )
        }
)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropositionEspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "La description est obligatoire")
    @Column(nullable = false, length = 2000)
    private String description;

    @NotNull(message = "La catégorie est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategorieEspace categorie;

    @NotBlank(message = "L'adresse est obligatoire")
    @Column(nullable = false)
    private String adresse;

    @NotNull(message = "La latitude est obligatoire")
    @Column(nullable = false)
    private Float latitude;

    @NotNull(message = "La longitude est obligatoire")
    @Column(nullable = false)
    private Float longitude;

    @Column(length = 1000)
    private String motifRefus;

    private String imageUrl;

    @NotNull(message = "Le statut est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutProposition statut = StatutProposition.EN_ATTENTE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateProposition;

    @NotNull(message = "L'utilisateur est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Utilisateur proposePark;

    @PrePersist
    protected void onCreate() {
        this.dateProposition = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = StatutProposition.EN_ATTENTE;
        }
    }
}