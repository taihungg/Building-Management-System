package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.person.Resident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, UUID> {

}