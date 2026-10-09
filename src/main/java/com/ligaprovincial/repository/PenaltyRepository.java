package com.ligaprovincial.repository;

import com.ligaprovincial.model.entity.Penalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PenaltyRepository extends JpaRepository<Penalty, UUID> {
    List<Penalty> findAllByActivaTrueAndJugadorClubIdIn(List<UUID> clubIds);
    List<Penalty> findAllByJugadorIdAndActivaTrue(UUID jugadorId);
}
