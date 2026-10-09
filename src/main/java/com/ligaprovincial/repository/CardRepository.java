package com.ligaprovincial.repository;

import com.ligaprovincial.model.entity.Card;
import com.ligaprovincial.model.enums.CardType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CardRepository extends JpaRepository<Card, UUID> {
    long countByPartidoIdAndJugadorIdAndTipo(UUID partidoId, UUID jugadorId, CardType tipo);
    long countByPartidoTorneoIdAndJugadorIdAndTipo(UUID torneoId, UUID jugadorId, CardType tipo);
}
