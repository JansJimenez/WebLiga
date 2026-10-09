package com.ligaprovincial.model.entity;

import com.ligaprovincial.model.enums.TournamentFormat;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tournaments", indexes = {
    @Index(name = "idx_tournaments_anio", columnList = "anio")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tournament {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "nombre", nullable = false, length = 120)
    private String nombre;

    @Column(name = "anio", nullable = false)
    private Integer anio;

    @Enumerated(EnumType.STRING)
    @Column(name = "formato", nullable = false)
    private TournamentFormat formato;

    @Column(name = "puntos_victoria", nullable = false)
    @Builder.Default
    private Integer puntosVictoria = 3;

    @Column(name = "puntos_empate", nullable = false)
    @Builder.Default
    private Integer puntosEmpate = 1;

    @Column(name = "puntos_derrota", nullable = false)
    @Builder.Default
    private Integer puntosDerrota = 0;

    @Column(name = "max_amarillas_suspension", nullable = false)
    @Builder.Default
    private Integer maxAmarillasSuspension = 3;

    @OneToMany(mappedBy = "torneo", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Match> partidos = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
