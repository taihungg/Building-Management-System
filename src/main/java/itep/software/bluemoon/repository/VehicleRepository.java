package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.Vehicle;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByOwner_Apartment_Id(UUID apartmentId);

    int countByOwner_Apartment_Id(UUID apartmentId);

    @Query("SELECT v FROM Vehicle v " +
           "JOIN FETCH v.owner o " +
           "JOIN FETCH o.apartment a " +
           "WHERE a.id IN :apartmentIds")
    List<Vehicle> findAllByApartmentIds(@Param("apartmentIds") List<UUID> apartmentIds);
}
