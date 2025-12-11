package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.accounting.Invoice;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.model.projection.InvoiceSummary;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {
    boolean existsByApartment_Id(UUID apartmentId);

    int countByApartment_IdAndStatusIn(UUID apartmentId, List<InvoiceStatus> statuses);

    @Query("SELECT b.id AS id, " +
           "CONCAT('P.', a.roomNumber) AS apartmentLabel, " + 
           "b.totalAmount AS totalAmount, " + 
           "b.status AS status, " +
           "b.paymentDate AS paymentDate, " +
           "b.createdTime AS createdTime " + 
           "FROM Invoice b " +
           "LEFT JOIN b.apartment a " +
           "WHERE " +
           "(:month IS NULL OR b.month = :month) " +
           "AND (:year IS NULL OR b.year = :year) " +
           "ORDER BY a.roomNumber ASC")
    List<InvoiceSummary> getInvoiceSummary(@Param("month") Integer month, @Param("year") Integer year);

    boolean existsByMonthAndYearAndStatusNot(int month, int year, InvoiceStatus status);

    List<Invoice> findByMonthAndYearAndStatus(int month, int year, InvoiceStatus status);
}
