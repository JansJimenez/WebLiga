package com.ligaprovincial.dto;

import com.ligaprovincial.model.enums.CardType;
import com.ligaprovincial.model.enums.MatchStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class MatchEventDTOs {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddGoalRequest {
        @NotNull(message = "El jugador_id es obligatorio")
        private UUID jugadorId;

        @NotNull(message = "El equipo_id es obligatorio")
        private UUID equipoId;

        @NotNull(message = "El minuto es obligatorio")
        @Min(value = 1, message = "El minuto mínimo es 1")
        @Max(value = 130, message = "El minuto máximo es 130")
        private Integer minuto;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddCardRequest {
        @NotNull(message = "El jugador_id es obligatorio")
        private UUID jugadorId;

        @NotNull(message = "El tipo de tarjeta es obligatorio")
        private CardType tipo;

        @NotNull(message = "El minuto es obligatorio")
        @Min(value = 1, message = "El minuto mínimo es 1")
        @Max(value = 130, message = "El minuto máximo es 130")
        private Integer minuto;

        private String motivo;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LineupValidationRequest {
        @NotNull(message = "La lista de IDs de jugadores es obligatoria")
        private List<UUID> playerIds;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LineupValidationResponse {
        private boolean valido;
        private UUID partidoId;
        private int totalJugadores;
        private List<EligiblePlayerDTO> jugadoresHabilitados;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EligiblePlayerDTO {
        private UUID id;
        private String dni;
        private String nombreCompleto;
        private String club;
        private Integer numeroCamiseta;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MatchResponse {
        private UUID id;
        private UUID torneoId;
        private String nombreTorneo;
        private UUID clubLocalId;
        private String nombreLocal;
        private UUID clubVisitaId;
        private String nombreVisita;
        private OffsetDateTime fechaHora;
        private String estadio;
        private Integer golesLocal;
        private Integer golesVisita;
        private MatchStatus estado;
    }
}
