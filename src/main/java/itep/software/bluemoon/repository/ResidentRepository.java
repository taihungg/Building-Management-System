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
    
    // Tìm cư dân theo ID tòa nhà (Building ID)
    @Query("SELECT r FROM Resident r JOIN r.apartment a WHERE a.building.id = :buildingId")
    List<Resident> findByBuildingId(@Param("buildingId") UUID buildingId);
    
    // Tìm cư dân theo Tầng (Floor) của một tòa nhà cụ thể
    @Query("SELECT r FROM Resident r JOIN r.apartment a " +
           "WHERE a.building.id = :buildingId AND a.floor = :floor")
    List<Resident> findByBuildingAndFloor(@Param("buildingId") UUID buildingId, @Param("floor") Integer floor);

    // Tìm cư dân thuộc danh sách các căn hộ cụ thể
    @Query("SELECT r FROM Resident r WHERE r.apartment.id IN :apartmentIds")
    List<Resident> findByApartmentIds(@Param("apartmentIds") List<UUID> apartmentIds);
    
    /*
     *  Tìm theo tên
     */
    // Tìm tất cả cư dân thuộc 1 tòa nhà dựa vào tên tòa
    @Query("SELECT r FROM Resident r WHERE r.apartment.building.name = :buildingName")
    List<Resident> findByBuildingName(@Param("buildingName") String buildingName);

    // Tìm theo tầng và tên tòa nhà
    @Query("SELECT r FROM Resident r WHERE r.apartment.floor = :floor AND r.apartment.building.name = :buildingName")
    List<Resident> findByFloorAndBuildingName(@Param("floor") int floor, @Param("buildingName") String buildingName);

    // Tìm theo danh sách số phòng trong 1 tóa cụ thể
    @Query("SELECT r FROM Resident r WHERE r.apartment.roomNumber IN :roomNumbers " +
    	       "AND r.apartment.building.name = :buildingName")
    List<Resident> findByRoomNumbersAndBuilding(@Param("roomNumbers") List<Integer> roomNumbers, 
    	                                        @Param("buildingName") String buildingName);
}