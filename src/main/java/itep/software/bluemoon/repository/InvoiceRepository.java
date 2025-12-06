package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accountant.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    boolean existsByApartment_Id(UUID apartmentId);
}
