package itep.software.bluemoon.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.accounting.ServiceType;
import itep.software.bluemoon.entity.accounting.UsageRecord;
import itep.software.bluemoon.enumeration.ServiceCode;

public interface UsageRecordRepository extends JpaRepository<UsageRecord, UUID>{
    @Query("SELECT u FROM UsageRecord u " +
        "JOIN FETCH u.apartment a " +
        "JOIN FETCH a.building " +
        "JOIN FETCH u.serviceType s " +
        "WHERE u.month = :month " +
        "AND u.year = :year " +
        "AND s.code = :serviceCode")
    List<UsageRecord> findByMonthAndYearAndServiceCode(
            @Param("month") int month,
            @Param("year") int year,
            @Param("serviceCode") ServiceCode serviceCode
    );

    Optional<UsageRecord> findByApartmentAndServiceTypeAndMonthAndYear(
            Apartment apartment, 
            ServiceType serviceType, 
            int month, 
            int year
    );

    @Query("SELECT u FROM UsageRecord u " +
       "JOIN u.serviceType s " +        // Chỉ JOIN để lọc, không có chữ FETCH
       "WHERE s.code = :code " +
       "AND u.month = :month " +
       "AND u.year = :year")
    List<UsageRecord> findAllByServiceCodeAndMonthAndYear(
        @Param("code") ServiceCode code,
        @Param("month") int month,
        @Param("year") int year
    );
}
