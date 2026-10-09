package com.ligaprovincial.controller;

import com.ligaprovincial.dto.StandingsDTO;
import com.ligaprovincial.dto.TopScorerDTO;
import com.ligaprovincial.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/tournament/{id}/standings")
    public ResponseEntity<List<StandingsDTO>> getStandings(@PathVariable UUID id) {
        return ResponseEntity.ok(statsService.calculateStandings(id));
    }

    @GetMapping("/tournament/{id}/top-scorers")
    public ResponseEntity<List<TopScorerDTO>> getTopScorers(@PathVariable UUID id) {
        return ResponseEntity.ok(statsService.getTopScorers(id));
    }
}
