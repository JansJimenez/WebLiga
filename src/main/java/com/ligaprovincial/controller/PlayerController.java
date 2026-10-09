package com.ligaprovincial.controller;

import com.ligaprovincial.dto.PlayerDTO.*;
import com.ligaprovincial.service.PlayerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @GetMapping
    public ResponseEntity<List<PlayerResponse>> getAllPlayers(@RequestParam(required = false, name = "club_id") UUID clubId) {
        return ResponseEntity.ok(playerService.findAll(clubId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlayerResponse> getPlayerById(@PathVariable UUID id) {
        return ResponseEntity.ok(playerService.findById(id));
    }

    @GetMapping("/{id}/digital-card")
    public ResponseEntity<DigitalCardResponse> getDigitalCard(@PathVariable UUID id) {
        return ResponseEntity.ok(playerService.generateDigitalCard(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'DELEGADO')")
    public ResponseEntity<PlayerResponse> createPlayer(@Valid @RequestBody CreatePlayerRequest request) {
        PlayerResponse created = playerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
