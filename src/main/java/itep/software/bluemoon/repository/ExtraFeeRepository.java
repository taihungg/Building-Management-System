package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import itep.software.bluemoon.entity.accounting.ExtraFee;
import itep.software.bluemoon.model.projection.ExtraFeeSummary;

public interface ExtraFeeRepository extends JpaRepository<ExtraFee, UUID> {
    @Query("SELECT e.id AS id, " +
        "e.title AS title, " +
        "e.amount AS amount, " +
        "e.feeDate AS feeDate, " +
        "e.isBilled AS billed, " +
        "a.roomNumber AS apartmentLabel " +
        "FROM ExtraFee e " +
        "JOIN e.apartment a " +
        "WHERE (:keyword IS NULL OR :keyword = '' OR " +
        "LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(a.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ExtraFeeSummary> searchGeneral(@Param("keyword") String keyword);
}
