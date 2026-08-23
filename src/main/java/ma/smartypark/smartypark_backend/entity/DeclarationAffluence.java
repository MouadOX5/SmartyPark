package ma.smartypark.smartypark_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "declarations_affluence")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeclarationAffluence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "L'espace public est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "espace_public_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    @ToString.Exclude
    private EspacePublic espacePublic;



    @NotNull(message = "L'utilisateur est obligatoire")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    @ToString.Exclude
    private Utilisateur utilisateur;



    @NotNull(message = "Le statut d'affluence est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutAffluence statutAffluence;


    @Column(nullable = false, updatable = false)
    private LocalDateTime dateDeclaration;



    @PrePersist
    protected void onCreate() {
        this.dateDeclaration = LocalDateTime.now();
    }
}