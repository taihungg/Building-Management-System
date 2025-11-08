package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.person.Resident;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, UUID> {
    @Query("SELECT r FROM Resident r LEFT JOIN r.account u WHERE " +
            "LOWER(r.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "r.idCard LIKE CONCAT('%', :keyword, '%') OR " +
            "u.phone LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    public List<Resident> searchGeneral(@Param("keyword") String keyword);
}
