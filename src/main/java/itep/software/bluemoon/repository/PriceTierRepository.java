package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accountant.PriceTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PriceTierRepository extends JpaRepository<PriceTier, UUID> {
}
