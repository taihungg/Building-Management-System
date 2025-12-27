package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.model.projection.AnnouncementSummary;


@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
	
    @Query("""
        SELECT DISTINCT a FROM Announcement a
        LEFT JOIN FETCH a.sender
        ORDER BY a.createdDate DESC
        """)
    List<Announcement> findAllWithSender();
    
    @Query(value = """
        SELECT DISTINCT a FROM Announcement a
        LEFT JOIN FETCH a.sender
        """,
        countQuery = "SELECT COUNT(a) FROM Announcement a")
    Page<Announcement> findAllWithSender(Pageable pageable);
	
	
	@Query("""
		    SELECT a.id as id,
		           a.title as title,
		           a.message as message,
		           a.sender.fullName as senderName,
		           a.createdDate as createdDate
		    FROM ResidentAnnouncement ra
		    JOIN ra.announcement a
		    WHERE ra.resident.id = :residentId
		    ORDER BY a.createdDate DESC
		    """)
		List<AnnouncementSummary> findAnnouncementsByResidentId(@Param("residentId") UUID residentId);
}