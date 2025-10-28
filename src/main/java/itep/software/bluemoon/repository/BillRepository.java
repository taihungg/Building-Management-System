package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Bill;
import itep.software.bluemoon.enumeration.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {
    
    // Tìm hóa đơn theo status và trong khoảng thời gian
    List<Bill> findByStatusAndExpiredDateBetween(
            BillStatus status, 
            LocalDate startDate, 
            LocalDate endDate);
    
    // Tìm hóa đơn theo status và trước một ngày cụ thể
    List<Bill> findByStatusAndExpiredDateBefore(
            BillStatus status, 
            LocalDate date);
}