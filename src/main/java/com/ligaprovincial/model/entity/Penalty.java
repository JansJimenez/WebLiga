package com.ligaprovincial.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "penalties", indexes = {
    @Index(name = "idx_penalties_jugador_id", columnList = "jugador_id"),
    @Index(name = "idx_penalties_activa", columnList = "activa")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Penalty {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "jugador_id", nullable = false)
    private Player jugador;

    @Column(name = "fechas_suspension", nullable = false)
    private Integer fechasSuspension;

    @Column(name = "fechas_cumplidas", nullable = false)
    @Builder.Default
    private Integer fechasCumplidas = 0;

    @Column(name = "motivo", nullable = false, length = 255)
    private String motivo;

    @Column(name = "activa", nullable = false)
    @Builder.Default
    private Boolean activa = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
