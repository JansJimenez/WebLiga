package com.ligaprovincial.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "clubs", indexes = {
    @Index(name = "idx_clubs_activo", columnList = "activo"),
    @Index(name = "idx_clubs_nombre_corto", columnList = "nombre_corto")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "nombre_oficial", nullable = false, length = 150)
    private String nombreOficial;

    @Column(name = "nombre_corto", nullable = false, length = 50)
    private String nombreCorto;

    @Column(name = "fundacion_year")
    private Integer fundacionYear;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "color_principal", length = 30)
    private String colorPrincipal;

    @Column(name = "color_secundario", length = 30)
    private String colorSecundario;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @OneToMany(mappedBy = "club", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Player> jugadores = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
