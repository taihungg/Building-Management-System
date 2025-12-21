package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.model.projection.ResidentSummary;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, UUID> {
    @Query("SELECT r.id AS id, " +
       "CONCAT(r.fullName, " +
       "COALESCE(CONCAT(' - ', r.phone), ''), " +
       "COALESCE(CONCAT(' - P.', a.roomNumber), '')) AS label " +
       "FROM Resident r " +
       "LEFT JOIN r.apartment a " +
       "WHERE LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR r.phone LIKE CONCAT('%', :keyword, '%') " +
       "OR CAST(a.roomNumber AS string) LIKE CONCAT('%', :keyword, '%') " +
       "ORDER BY r.fullName ASC")
    List<Dropdown> searchForDropdown(@Param("keyword") String keyword);

    @Query("SELECT r.id AS id, " +
       "r.fullName AS fullName, " +
       "r.email AS email, " +
       "r.phone AS phone, " +
       "a.roomNumber AS roomNumber, " +
       "r.status AS status " +
       "FROM Resident r " +
       "LEFT JOIN r.apartment a " +
       "WHERE " +
       "((:keyword IS NULL OR :keyword = '') " +
       "OR (LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR r.phone LIKE CONCAT('%', :keyword, '%') " +
       "OR LOWER(r.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR CAST(a.roomNumber AS string) LIKE CONCAT('%', :keyword, '%'))) " +
       "AND (:includeInactive = true OR r.status != 'INACTIVE')")
    List<ResidentSummary> searchGeneral(@Param("keyword") String keyword, 
                                        @Param("includeInactive") boolean includeInactive);

    @Query("SELECT r.id AS id, " +
           "r.fullName AS fullName, " +
           "u.phone AS phoneNumber, " +
           "u.email AS email, " +
           "a.roomNumber AS roomNumber, " +
           "r.status AS status " +
           "FROM Resident r " +
           "LEFT JOIN r.account u " +
           "LEFT JOIN r.apartment a " +
           "WHERE a.id = :apartmentId")
    List<ResidentSummary> findByApartment_Id(@Param("apartmentId") UUID apartmentId);

    boolean existsByApartment_Id(UUID apartmentId);
}
