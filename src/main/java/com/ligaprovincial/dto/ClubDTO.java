package com.ligaprovincial.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

public class ClubDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateClubRequest {
        @NotBlank(message = "El nombre oficial es obligatorio")
        private String nombreOficial;

        @NotBlank(message = "El nombre corto es obligatorio")
        private String nombreCorto;

        private Integer fundacionYear;
        private String logoUrl;
        private String colorPrincipal;
        private String colorSecundario;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ClubResponse {
        private UUID id;
        private String nombreOficial;
        private String nombreCorto;
        private Integer fundacionYear;
        private String logoUrl;
        private String colorPrincipal;
        private String colorSecundario;
        private Boolean activo;
        private int totalJugadores;
    }
}
