package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.model.projection.ApartmentSummary;
import itep.software.bluemoon.model.projection.Dropdown;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, UUID> {
    @Query("SELECT a.id as id, " +
        "CONCAT('Tòa ', b.name, ' - P.', a.roomNumber, ' (Tầng ', a.floor, ')') as label " +
        "FROM Apartment a " +
        "JOIN a.building b " +
        "WHERE " +
        "(LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
        "OR CAST(a.roomNumber AS String) LIKE CONCAT('%', :keyword, '%') " +
        "OR LOWER(CONCAT(b.name, a.roomNumber)) LIKE LOWER(CONCAT('%', :keyword, '%')))" +
        "ORDER BY b.name ASC, a.roomNumber ASC")
    List<Dropdown> searchForDropdown(@Param("keyword") String keyword);

    @Query("SELECT a.id AS id, " +
           "CAST(a.roomNumber AS String) AS label, " + // Ép kiểu int -> String
           "a.floor AS floor, " +
           "CAST(a.area AS double) AS area, " + // Ép kiểu BigDecimal -> Double (cho chắc chắn khớp Interface)
           // SUBQUERY: Đếm số cư dân thuộc căn hộ này từ bảng Resident
           "(SELECT CAST(COUNT(r) AS int) FROM Resident r WHERE r.apartment.id = a.id) AS residentNumber " + 
           "FROM Apartment a " +
           "WHERE " +
           // 1. Logic Keyword (Nếu null lấy hết, nếu có thì tìm theo số phòng)
           "(:keyword IS NULL OR :keyword = '' OR CAST(a.roomNumber AS String) LIKE CONCAT('%', :keyword, '%')) " +
           // 2. Logic Building (Optional)
           "AND (:buildingId IS NULL OR a.building.id = :buildingId) " +
           // 3. Logic Floor (Optional)
           "AND (:floor IS NULL OR a.floor = :floor)")
    List<ApartmentSummary> searchGeneral(@Param("keyword") String keyword, @Param("buildingId") UUID buildingId, @Param("floor") Integer floor);

    @Query("SELECT DISTINCT r.apartment FROM Resident r")
    List<Apartment> findApartmentsWithResidents();
    
    List<Apartment> findByBuildingId(UUID buildingId);
    List<Apartment> findByBuildingIdAndFloor(UUID buildingId, Integer floor);
}
