package itep.software.bluemoon.repository;

import java.util.List;
import java.util.Optional;
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
            "(:keyword IS NULL OR :keyword = '' " +
            " OR LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            " OR LOWER(r.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            " OR LOWER(r.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            " OR CONCAT(a.roomNumber, '') LIKE CONCAT('%', :keyword, '%')) " +
            "AND " +
            "(:includeInactive = true OR r.status != 'INACTIVE')")
    List<ResidentSummary> searchGeneral(@Param("keyword") String keyword, @Param("includeInactive") boolean includeInactive);

    @Query("SELECT r FROM Resident r " +
       "LEFT JOIN FETCH r.apartment " +
       "WHERE r.id = :id")
    Optional<Resident> findResidentWithDetails(@Param("id") UUID id);

    @Query("SELECT r.id AS id, " +
       "r.fullName AS fullName, " +
       "r.email AS email, " +
       "r.phone AS phone, " +
       "a.roomNumber AS roomNumber, " +
       "r.status AS status " +
       "FROM Resident r " +
       "LEFT JOIN r.apartment a " +
       "WHERE a.id = :apartmentId")
    List<ResidentSummary> findByApartment_Id(@Param("apartmentId") UUID apartmentId);

    boolean existsByApartment_Id(UUID apartmentId);

    int countByApartment_Id(UUID apartmentId);
    
    
    /*
     * Queery cho API tạo thông báo
     */
    

    // Tìm cư dân theo ID tòa nhà (đã có hoặc cần thêm mới)
    @Query("SELECT r FROM Resident r JOIN r.apartment a WHERE a.building.id = :buildingId")
    List<Resident> findByBuildingId(@Param("buildingId") UUID buildingId);

    // Tìm cư dân theo danh sách NHIỀU tầng của 1 tòa
    @Query("SELECT r FROM Resident r " +
    	       "JOIN FETCH r.apartment a " +
    	       "JOIN FETCH a.building b " +
    	       "WHERE b.id = :buildingId AND a.floor IN :floors")
    List<Resident> findByBuildingAndFloors(@Param("buildingId") UUID buildingId, @Param("floors") List<Integer> floors);

    //Tìm cư dân theo danh sách ID căn hộ
    @Query("SELECT r FROM Resident r WHERE r.apartment.id IN :apartmentIds")
    List<Resident> findByApartmentIds(@Param("apartmentIds") List<UUID> apartmentIds);
}