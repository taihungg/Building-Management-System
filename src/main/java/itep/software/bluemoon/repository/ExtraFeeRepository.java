package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.accounting.ExtraFee;
import itep.software.bluemoon.model.projection.ExtraFeeSummary;

public interface ExtraFeeRepository extends JpaRepository<ExtraFee, UUID> {
    @Query("SELECT e.id AS id, " +
        "e.title AS title, " +
        "e.amount AS amount, " +
        "e.feeDate AS feeDate, " +
        "e.isBilled AS isBilled, " +
        "CONCAT('Căn hộ ', cast(a.roomNumber as String), ' - Tòa nhà ', b.name) AS apartmentLabel " + 
        "FROM ExtraFee e " +
        "JOIN e.apartment a " +
        "JOIN a.building b " +
        "WHERE (:keyword IS NULL OR :keyword = '' " +
        "OR LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
        "OR LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
        "OR cast(a.roomNumber as String) LIKE CONCAT('%', :keyword, '%') " +
        "OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ExtraFeeSummary> searchGeneral(@Param("keyword") String keyword);

    List<ExtraFee> findByApartmentAndIsBilledFalse(Apartment apartment);

    @Modifying
    @Query("UPDATE ExtraFee e SET e.isBilled = :status WHERE e.id IN :ids")
    void updateStatusByIds(@Param("status") boolean status, @Param("ids") List<UUID> ids);
}
