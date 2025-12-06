package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accountant.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, UUID> {
}
