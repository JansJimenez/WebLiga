package com.ligaprovincial.service;

import com.ligaprovincial.dto.PlayerDTO.*;
import com.ligaprovincial.model.entity.Club;
import com.ligaprovincial.model.entity.Player;
import com.ligaprovincial.repository.ClubRepository;
import com.ligaprovincial.repository.PlayerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final ClubRepository clubRepository;

    @Transactional(readOnly = true)
    public List<PlayerResponse> findAll(UUID clubId) {
        List<Player> players = (clubId != null)
                ? playerRepository.findAllByClubIdOrderByApellidosAsc(clubId)
                : playerRepository.findAll();

        return players.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlayerResponse findById(UUID id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jugador con ID " + id + " no encontrado"));
        return mapToResponse(player);
    }

    @Transactional
    public PlayerResponse create(CreatePlayerRequest request) {
        if (playerRepository.existsByDni(request.getDni().trim())) {
            throw new IllegalArgumentException("Ya existe un jugador registrado con el DNI " + request.getDni());
        }

        Club club = clubRepository.findById(request.getClubId())
                .orElseThrow(() -> new EntityNotFoundException("El club especificado no existe"));

        Player player = Player.builder()
                .club(club)
                .dni(request.getDni().trim())
                .nombres(request.getNombres().trim())
                .apellidos(request.getApellidos().trim())
                .fechaNacimiento(request.getFechaNacimiento())
                .fotoUrl(request.getFotoUrl())
                .posicion(request.getPosicion())
                .numeroCamiseta(request.getNumeroCamiseta())
                .estadoMedico(request.getEstadoMedico() != null ? request.getEstadoMedico() : false)
                .habilitado(request.getHabilitado() != null ? request.getHabilitado() : true)
                .build();

        Player saved = playerRepository.save(player);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public DigitalCardResponse generateDigitalCard(UUID id) {
        Player player = playerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Jugador con ID " + id + " no encontrado"));

        boolean hasActivePenalties = player.getSanciones() != null &&
                player.getSanciones().stream().anyMatch(s -> Boolean.TRUE.equals(s.getActiva()));

        boolean isElegible = Boolean.TRUE.equals(player.getHabilitado()) &&
                Boolean.TRUE.equals(player.getEstadoMedico()) &&
                !hasActivePenalties;

        String rawPayload = String.format("{\"pid\":\"%s\",\"dni\":\"%s\",\"status\":\"%s\",\"ts\":%d}",
                player.getId(), player.getDni(), isElegible ? "OK" : "BLOCKED", System.currentTimeMillis());
        String qrBase64 = Base64.getEncoder().encodeToString(rawPayload.getBytes(StandardCharsets.UTF_8));

        return DigitalCardResponse.builder()
                .carnetId("LPF-" + player.getId().toString().substring(0, 8).toUpperCase())
                .dni(player.getDni())
                .nombreCompleto(player.getNombres() + " " + player.getApellidos())
                .club(player.getClub().getNombreOficial())
                .posicion(player.getPosicion() != null ? player.getPosicion() : "No especificada")
                .numeroCamiseta(player.getNumeroCamiseta())
                .estadoMedicoValido(player.getEstadoMedico())
                .habilitadoAdministrativo(player.getHabilitado())
                .tieneSancionesActivas(hasActivePenalties)
                .estadoCancha(isElegible ? "HABILITADO" : "INHABILITADO")
                .codigoVerificacionQr(qrBase64)
                .build();
    }

    private PlayerResponse mapToResponse(Player p) {
        boolean hasActivePenalties = p.getSanciones() != null &&
                p.getSanciones().stream().anyMatch(s -> Boolean.TRUE.equals(s.getActiva()));

        return PlayerResponse.builder()
                .id(p.getId())
                .clubId(p.getClub().getId())
                .nombreClub(p.getClub().getNombreCorto())
                .dni(p.getDni())
                .nombres(p.getNombres())
                .apellidos(p.getApellidos())
                .fechaNacimiento(p.getFechaNacimiento())
                .fotoUrl(p.getFotoUrl())
                .posicion(p.getPosicion())
                .numeroCamiseta(p.getNumeroCamiseta())
                .estadoMedico(p.getEstadoMedico())
                .habilitado(p.getHabilitado())
                .tieneSancionesActivas(hasActivePenalties)
                .build();
    }
}
