package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accounting.ServicePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, UUID> {
}
