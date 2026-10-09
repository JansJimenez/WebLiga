package com.ligaprovincial.model.entity;

import com.ligaprovincial.model.enums.MatchStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "matches", indexes = {
    @Index(name = "idx_matches_torneo_id", columnList = "torneo_id"),
    @Index(name = "idx_matches_club_local", columnList = "club_local_id"),
    @Index(name = "idx_matches_club_visita", columnList = "club_visita_id"),
    @Index(name = "idx_matches_fecha_hora", columnList = "fecha_hora"),
    @Index(name = "idx_matches_estado", columnList = "estado")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "torneo_id", nullable = false)
    private Tournament torneo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_local_id", nullable = false)
    private Club clubLocal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "club_visita_id", nullable = false)
    private Club clubVisita;

    @Column(name = "fecha_hora", nullable = false)
    private OffsetDateTime fechaHora;

    @Column(name = "estadio", length = 150)
    private String estadio;

    @Column(name = "goles_local")
    @Builder.Default
    private Integer golesLocal = 0;

    @Column(name = "goles_visita")
    @Builder.Default
    private Integer golesVisita = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    @Builder.Default
    private MatchStatus estado = MatchStatus.PROGRAMADO;

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Goal> goles = new ArrayList<>();

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Card> tarjetas = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
