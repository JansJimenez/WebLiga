package com.ligaprovincial.repository;

import com.ligaprovincial.model.entity.Match;
import com.ligaprovincial.model.enums.MatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MatchRepository extends JpaRepository<Match, UUID> {
    List<Match> findAllByTorneoIdOrderByFechaHoraAsc(UUID torneoId);
    List<Match> findAllByTorneoIdAndEstado(UUID torneoId, MatchStatus estado);
}
