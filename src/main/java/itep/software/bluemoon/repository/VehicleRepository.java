package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByOwner_Apartment_Id(UUID apartmentId);
}
