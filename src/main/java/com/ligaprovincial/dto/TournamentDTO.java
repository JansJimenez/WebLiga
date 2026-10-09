package com.ligaprovincial.dto;

import com.ligaprovincial.model.enums.TournamentFormat;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class TournamentDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateTournamentRequest {
        @NotBlank(message = "El nombre del torneo es obligatorio")
        private String nombre;

        @NotNull(message = "El año es obligatorio")
        @Min(value = 2020, message = "El año debe ser igual o mayor a 2020")
        private Integer anio;

        @NotNull(message = "El formato es obligatorio")
        private TournamentFormat formato;

        private Integer puntosVictoria = 3;
        private Integer puntosEmpate = 1;
        private Integer puntosDerrota = 0;
        private Integer maxAmarillasSuspension = 3;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GenerateFixtureRequest {
        @NotNull(message = "La lista de clubes es obligatoria")
        private List<UUID> clubIds;
        private LocalDate fechaInicio;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TournamentResponse {
        private UUID id;
        private String nombre;
        private Integer anio;
        private TournamentFormat formato;
        private Integer puntosVictoria;
        private Integer puntosEmpate;
        private Integer puntosDerrota;
        private Integer maxAmarillasSuspension;
        private int totalPartidos;
    }
}
