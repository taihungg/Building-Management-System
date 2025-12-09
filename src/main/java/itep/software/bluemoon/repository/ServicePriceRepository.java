package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accounting.ServicePrice;

import itep.software.bluemoon.enumeration.ServiceCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServicePriceRepository extends JpaRepository<ServicePrice, UUID> {
    @Query("SELECT p FROM ServicePrice p " +
           "JOIN p.serviceType s " +
           "WHERE s.code = :code " +
           "AND p.startDate <= :date " +
           "AND (p.endDate IS NULL OR p.endDate >= :date)")
    Optional<ServicePrice> findActivePriceByCode(@Param("code") ServiceCode code, @Param("date") LocalDate date);
}
