package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;


@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
	@Query("""
	        SELECT new itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO(
	            a.id, 
	            a.title, 
	            a.message, 
	            a.sender.fullName, 
	            a.createdAt,
	            CAST(a.targetType AS string),
	            a.targetDetail,
	            COUNT(ra)
	        )
	        FROM Announcement a
	        LEFT JOIN a.residentAnnouncements ra
	        GROUP BY a.id, a.title, a.message, a.sender.fullName, a.createdAt, a.targetType, a.targetDetail
	        ORDER BY a.createdAt DESC
	    """)
	    List<AnnouncementResponseDTO> findAllSummary();
}