package itep.software.bluemoon.repository;

import java.math.BigDecimal;
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

    List<Invoice> findByMonthAndYear(int month, int year);

    long countByStatus(InvoiceStatus status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0) FROM Invoice i WHERE i.status = :status")
    BigDecimal sumTotalAmountByStatus(@Param("status") InvoiceStatus status);

    @Query("SELECT " +
        "   EXTRACT(MONTH FROM i.createdTime) as month, " +
        "   SUM(i.totalAmount) as totalRevenue, " +
        "   SUM(CASE WHEN i.status = 'PAID' THEN i.totalAmount ELSE 0 END) as paidRevenue " +
        "FROM Invoice i " +
        "WHERE EXTRACT(YEAR FROM i.createdTime) = :year " +
        "GROUP BY EXTRACT(MONTH FROM i.createdTime)")
    List<Object[]> findMonthlyRevenueByYear(@Param("year") int year);

    @Query("SELECT st.code, SUM(d.amount) " +
           "FROM Invoice i " +
           "JOIN i.details d " +
           "JOIN d.serviceType st " +
           "WHERE i.month = :month " +
           "AND i.year = :year " +
           "AND i.status = 'PAID' " +
           "GROUP BY st.code")
    List<Object[]> findRevenueDistribution(@Param("month") int month, @Param("year") int year);
}
