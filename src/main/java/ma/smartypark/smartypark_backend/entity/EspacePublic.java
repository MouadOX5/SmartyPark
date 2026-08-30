package ma.smartypark.smartypark_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter 
@Setter
@Table(name = "espaces_publics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspacePublic {

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

    @NotNull(message = "Le statut de validation est obligatoire")
    @Column(nullable = false)
    @Builder.Default
    private Boolean estValide = false;

    @Column(nullable = false, updatable = false)
    private LocalDateTime dateCreation;

    @NotNull(message = "Le statut d'affluence est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StatutAffluence statutAffluenceActuel = StatutAffluence.INCONNU;

    /** URL ou chemin relatif de l'image de couverture de l'espace public */
    @Column(length = 1000)
    private String imageUrl;

    @OneToMany(mappedBy = "espacePublic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Presence> presences;

    @OneToMany(mappedBy = "espacePublic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<Signalement> signalements;

    @OneToMany(mappedBy = "espacePublic", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @ToString.Exclude
    private List<DeclarationAffluence> declarationsAffluence;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
        if (this.estValide == null) {
            this.estValide = false;
        }
        if (this.statutAffluenceActuel == null) {
            this.statutAffluenceActuel = StatutAffluence.INCONNU;
        }
    }
}