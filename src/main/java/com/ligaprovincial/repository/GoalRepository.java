package com.ligaprovincial.repository;

import com.ligaprovincial.model.entity.Goal;
import com.ligaprovincial.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {
    List<Goal> findAllByPartidoTorneoIdAndPartidoEstado(UUID torneoId, MatchStatus estado);
    long countByPartidoIdAndEquipoId(UUID partidoId, UUID equipoId);
}
