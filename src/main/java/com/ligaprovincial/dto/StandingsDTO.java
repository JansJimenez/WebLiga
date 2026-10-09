package com.ligaprovincial.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StandingsDTO {
    private int posicion;
    private UUID clubId;
    private String nombreClub;
    private String nombreCorto;
    private String logoUrl;
    private int pj; // Partidos Jugados
    private int pg; // Partidos Ganados
    private int pe; // Partidos Empatados
    private int pp; // Partidos Perdidos
    private int gf; // Goles a Favor
    private int gc; // Goles en Contra
    private int dg; // Diferencia de Goles
    private int puntos; // Puntos Totales
}
