package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.model.DTO.announcement.RecipientResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.ResidentAnnouncementResponseDTO;

@Repository
public interface ResidentAnnouncementRepository extends JpaRepository<ResidentAnnouncement, UUID> {

	   @Query("""
	           SELECT new itep.software.bluemoon.model.DTO.announcement.ResidentAnnouncementResponseDTO
	           (ra.id, a.title, a.message, s.fullName, a.createdAt, ra.isRead) 
	           FROM ResidentAnnouncement ra
	           JOIN ra.announcement a
	           JOIN a.sender s
	           WHERE ra.resident.id = :residentId
	           ORDER BY a.createdAt DESC
	           """)
	    List<ResidentAnnouncementResponseDTO> findAllByResidentId(@Param("residentId") UUID residentId);
    
    
    //Lấy danh sách người nhận thông báo
    @Query("""
            SELECT new itep.software.bluemoon.model.DTO.announcement.RecipientResponseDTO(
                r.id,
                r.fullName,
                CONCAT('P.', apt.roomNumber, ' - ', b.name),
                ra.isRead
            )
            FROM ResidentAnnouncement ra
            JOIN ra.resident r
            LEFT JOIN r.apartment apt
            LEFT JOIN apt.floor.building b
            WHERE ra.announcement.id = :announcementId
        """)
        List<RecipientResponseDTO> findRecipientsByAnnouncementId(@Param("announcementId") UUID announcementId);
}