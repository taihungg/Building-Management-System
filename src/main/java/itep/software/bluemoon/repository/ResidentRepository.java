package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.projection.ResidentSummary;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, UUID> {

    @Query("SELECT r.id AS id, " +
           "r.fullName AS fullName, " +
           "u.phone AS phoneNumber, " +
           "u.email AS email, " +
           "a.roomNumber AS roomNumber, " +
           "r.status AS status " +
           "FROM Resident r " +
           "LEFT JOIN r.account u " +
           "LEFT JOIN r.apartment a " +
           "WHERE " +
           "(LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR r.idCard LIKE CONCAT('%', :keyword, '%') " +
           "OR u.phone LIKE CONCAT('%', :keyword, '%') " +
           "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
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
           "LEFT JOIN r.apartment a")
    List<ResidentSummary> findAllSummary();

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
}
