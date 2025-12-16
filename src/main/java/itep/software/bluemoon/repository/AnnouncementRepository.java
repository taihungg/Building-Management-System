package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.model.projection.AnnouncementSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;


@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
	List<Announcement> findAllByOrderByCreatedAtDesc();
	
	@Query("""
	        SELECT a.id as id,
	               a.title as title,
	               a.message as message,
	               a.sender.fullName as senderName,
	               a.createdAt as createdAt
	        FROM Announcement a
	        JOIN a.receiver r
	        WHERE r.id = :residentId
	        ORDER BY a.createdAt DESC
	        """)
	    List<AnnouncementSummary> findAnnouncementsByResidentId(@Param("residentId") UUID residentId);
}
