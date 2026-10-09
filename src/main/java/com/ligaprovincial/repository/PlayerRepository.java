package com.ligaprovincial.repository;

import com.ligaprovincial.model.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlayerRepository extends JpaRepository<Player, UUID> {
    Optional<Player> findByDni(String dni);
    boolean existsByDni(String dni);
    List<Player> findAllByClubIdOrderByApellidosAsc(UUID clubId);
    List<Player> findAllByIdIn(List<UUID> ids);
}
