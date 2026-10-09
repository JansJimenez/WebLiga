package com.ligaprovincial.repository;

import com.ligaprovincial.model.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClubRepository extends JpaRepository<Club, UUID> {
    List<Club> findAllByActivoTrueOrderByNombreOficialAsc();
    List<Club> findByIdIn(List<UUID> ids);
}
