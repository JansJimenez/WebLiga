package com.ligaprovincial.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

public class PlayerDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreatePlayerRequest {
        @NotNull(message = "El club_id es obligatorio")
        private UUID clubId;

        @NotBlank(message = "El DNI es obligatorio")
        private String dni;

        @NotBlank(message = "Los nombres son obligatorios")
        private String nombres;

        @NotBlank(message = "Los apellidos son obligatorios")
        private String apellidos;

        @NotNull(message = "La fecha de nacimiento es obligatoria")
        private LocalDate fechaNacimiento;

        private String fotoUrl;
        private String posicion;
        private Integer numeroCamiseta;
        private Boolean estadoMedico = false;
        private Boolean habilitado = true;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlayerResponse {
        private UUID id;
        private UUID clubId;
        private String nombreClub;
        private String dni;
        private String nombres;
        private String apellidos;
        private LocalDate fechaNacimiento;
        private String fotoUrl;
        private String posicion;
        private Integer numeroCamiseta;
        private Boolean estadoMedico;
        private Boolean habilitado;
        private boolean tieneSancionesActivas;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DigitalCardResponse {
        private String carnetId;
        private String dni;
        private String nombreCompleto;
        private String club;
        private String posicion;
        private Integer numeroCamiseta;
        private Boolean estadoMedicoValido;
        private Boolean habilitadoAdministrativo;
        private Boolean tieneSancionesActivas;
        private String estadoCancha; // HABILITADO o INHABILITADO
        private String codigoVerificacionQr;
    }
}
