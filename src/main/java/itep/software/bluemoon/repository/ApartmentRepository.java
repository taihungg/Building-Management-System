package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.model.projection.ApartmentDropdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, UUID> {
    @Query("SELECT a.id as id, " +
            "CONCAT(a.roomNumber, ' (Tầng ', a.floor, ')') as label " +
            "FROM Apartment a " +
            "WHERE CAST(a.roomNumber AS String) LIKE CONCAT('%', :keyword, '%') " +
            "ORDER BY a.roomNumber ASC")
    List<ApartmentDropdown> searchForDropdown(@Param("keyword") String keyword);
}
