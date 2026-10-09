package com.ligaprovincial.controller;

import com.ligaprovincial.dto.TournamentDTO.*;
import com.ligaprovincial.model.entity.Match;
import com.ligaprovincial.service.TournamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public ResponseEntity<List<TournamentResponse>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentResponse> getTournamentById(@PathVariable UUID id) {
        return ResponseEntity.ok(tournamentService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TournamentResponse> createTournament(@Valid @RequestBody CreateTournamentRequest request) {
        TournamentResponse created = tournamentService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/generate-fixture")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<?> generateFixture(
            @PathVariable UUID id,
            @Valid @RequestBody GenerateFixtureRequest request) {
        List<Match> matches = tournamentService.generateRoundRobinFixture(id, request.getClubIds(), request.getFechaInicio());
        return ResponseEntity.ok().body(java.util.Map.of(
                "mensaje", "Fixture Round-Robin generado exitosamente con " + matches.size() + " partidos",
                "totalPartidos", matches.size()
        ));
    }
}
