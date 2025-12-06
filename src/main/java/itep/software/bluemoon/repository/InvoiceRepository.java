package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    boolean existsByApartment_Id(UUID apartmentId);

    int countByApartment_IdAndStatusIn(UUID apartmentId, List<InvoiceStatus> statuses);
}
