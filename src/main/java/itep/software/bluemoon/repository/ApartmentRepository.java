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
            "CONCAT(b.name, ' - ', a.roomNumber) AS label, " +
            "a.floor AS floor, " +
            "a.area AS area, " +
            "(SELECT COUNT(r) FROM Resident r WHERE r.apartment.id = a.id) AS residentNumber " +
            "FROM Apartment a " +
            "LEFT JOIN a.building b " +
            "WHERE " +
            "(:buildingId IS NULL OR b.id = :buildingId) " +
            "AND (:floor IS NULL OR a.floor = :floor) " +
            "AND (:keyword IS NULL OR :keyword = '' " +
            "OR CAST(a.roomNumber AS string) LIKE CONCAT('%', :keyword, '%') " +
            "OR LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY b.name ASC, a.floor ASC, a.roomNumber ASC")
    List<ApartmentSummary> searchGeneral(@Param("keyword") String keyword, @Param("buildingId") UUID buildingId, @Param("floor") Integer floor);

    @Query("SELECT DISTINCT a FROM Apartment a JOIN a.residents r")
    List<Apartment> findApartmentsWithResidents();
    
    List<Apartment> findByBuildingId(UUID buildingId);
    List<Apartment> findByBuildingIdAndFloor(UUID buildingId, Integer floor);
}
