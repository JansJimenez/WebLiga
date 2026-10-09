package com.ligaprovincial.service;

import com.ligaprovincial.dto.ClubDTO.*;
import com.ligaprovincial.model.entity.Club;
import com.ligaprovincial.repository.ClubRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;

    @Transactional(readOnly = true)
    public List<ClubResponse> findAll() {
        return clubRepository.findAllByActivoTrueOrderByNombreOficialAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClubResponse findById(UUID id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Club con ID " + id + " no encontrado"));
        return mapToResponse(club);
    }

    @Transactional
    public ClubResponse create(CreateClubRequest request) {
        Club club = Club.builder()
                .nombreOficial(request.getNombreOficial().trim())
                .nombreCorto(request.getNombreCorto().trim())
                .fundacionYear(request.getFundacionYear())
                .logoUrl(request.getLogoUrl())
                .colorPrincipal(request.getColorPrincipal())
                .colorSecundario(request.getColorSecundario())
                .activo(true)
                .build();

        Club saved = clubRepository.save(club);
        return mapToResponse(saved);
    }

    private ClubResponse mapToResponse(Club club) {
        return ClubResponse.builder()
                .id(club.getId())
                .nombreOficial(club.getNombreOficial())
                .nombreCorto(club.getNombreCorto())
                .fundacionYear(club.getFundacionYear())
                .logoUrl(club.getLogoUrl())
                .colorPrincipal(club.getColorPrincipal())
                .colorSecundario(club.getColorSecundario())
                .activo(club.getActivo())
                .totalJugadores(club.getJugadores() != null ? club.getJugadores().size() : 0)
                .build();
    }
}
