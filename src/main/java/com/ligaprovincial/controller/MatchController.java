package com.ligaprovincial.controller;

import com.ligaprovincial.dto.MatchEventDTOs.*;
import com.ligaprovincial.model.entity.Card;
import com.ligaprovincial.model.entity.Goal;
import com.ligaprovincial.model.entity.Match;
import com.ligaprovincial.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatchById(@PathVariable UUID id) {
        Match match = matchService.findById(id);
        return ResponseEntity.ok(MatchResponse.builder()
                .id(match.getId())
                .torneoId(match.getTorneo().getId())
                .nombreTorneo(match.getTorneo().getNombre())
                .clubLocalId(match.getClubLocal().getId())
                .nombreLocal(match.getClubLocal().getNombreOficial())
                .clubVisitaId(match.getClubVisita().getId())
                .nombreVisita(match.getClubVisita().getNombreOficial())
                .fechaHora(match.getFechaHora())
                .estadio(match.getEstadio())
                .golesLocal(match.getGolesLocal())
                .golesVisita(match.getGolesVisita())
                .estado(match.getEstado())
                .build());
    }

    @PostMapping("/{id}/validate-lineup")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DELEGADO', 'ARBITRO')")
    public ResponseEntity<LineupValidationResponse> validateLineup(
            @PathVariable UUID id,
            @Valid @RequestBody LineupValidationRequest request) {
        return ResponseEntity.ok(matchService.validateLineup(id, request.getPlayerIds()));
    }

    @PostMapping("/{id}/goals")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ARBITRO')")
    public ResponseEntity<?> addGoal(
            @PathVariable UUID id,
            @Valid @RequestBody AddGoalRequest request) {
        Goal goal = matchService.addGoal(id, request);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Gol registrado con éxito",
                "golId", goal.getId(),
                "minuto", goal.getMinuto()
        ));
    }

    @PostMapping("/{id}/cards")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ARBITRO')")
    public ResponseEntity<?> addCard(
            @PathVariable UUID id,
            @Valid @RequestBody AddCardRequest request) {
        Card card = matchService.addCard(id, request);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Tarjeta registrada en acta oficial",
                "tarjetaId", card.getId(),
                "tipo", card.getTipo(),
                "minuto", card.getMinuto()
        ));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ARBITRO')")
    public ResponseEntity<?> closeMatchPatch(@PathVariable UUID id) {
        Match closed = matchService.closeMatch(id);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Acta sellada formalmente. El partido ha finalizado y los datos son inmutables.",
                "estado", closed.getEstado(),
                "marcadorFinal", closed.getGolesLocal() + " - " + closed.getGolesVisita()
        ));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ARBITRO')")
    public ResponseEntity<?> closeMatchPost(@PathVariable UUID id) {
        return closeMatchPatch(id);
    }
}
