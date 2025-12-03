package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.model.projection.Dropdown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BuildingRepository extends JpaRepository<Building, UUID> {
    @Query("SELECT b.id AS id, " +
            "b.name AS label " +
            "FROM Building b " +
            "WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(b.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY b.name ASC")
    List<Dropdown> searchForDropdown(@Param("keyword") String keyword);
}
