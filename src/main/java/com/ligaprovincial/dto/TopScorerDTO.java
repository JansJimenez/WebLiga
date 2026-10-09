package com.ligaprovincial.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopScorerDTO {
    private UUID jugadorId;
    private String nombres;
    private String apellidos;
    private String club;
    private String logoClub;
    private long totalGoles;
}
