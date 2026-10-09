package com.ligaprovincial.controller;

import com.ligaprovincial.dto.ClubDTO.*;
import com.ligaprovincial.service.ClubService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @GetMapping
    public ResponseEntity<List<ClubResponse>> getAllClubs() {
        return ResponseEntity.ok(clubService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponse> getClubById(@PathVariable UUID id) {
        return ResponseEntity.ok(clubService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ClubResponse> createClub(@Valid @RequestBody CreateClubRequest request) {
        ClubResponse created = clubService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
