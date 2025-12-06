package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.accounting.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, UUID> {
}
