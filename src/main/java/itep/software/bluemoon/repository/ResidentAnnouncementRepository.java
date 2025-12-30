package itep.software.bluemoon.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Modifying;
import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.entity.key.ResidentAnnouncementId;
import itep.software.bluemoon.model.projection.AnnouncementWithReadStatus;
import itep.software.bluemoon.model.projection.RecipientStatusSummary;

@Repository
public interface ResidentAnnouncementRepository extends JpaRepository<ResidentAnnouncement, ResidentAnnouncementId> {
    
    // Resident xem announcements với trạng thái đã đọc
    @Query("""
        SELECT a.id as id,
               a.title as title,
               a.message as message,
               s.fullName as senderName,
               a.createdDate as createdDate,
               ra.isRead as isRead
        FROM ResidentAnnouncement ra
        JOIN ra.announcement a
        JOIN a.sender s
        WHERE ra.id.residentId = :residentId
        ORDER BY a.createdDate DESC
        """)
    List<AnnouncementWithReadStatus> findAnnouncementsByResidentId(
        @Param("residentId") UUID residentId
    );
    
    // Staff xem recipient statuses 
    @Query("""
        SELECT r.fullName as residentName,
               a.roomNumber as roomNumber,
               b.name as buildingName,
               ra.isRead as isRead
        FROM ResidentAnnouncement ra
        JOIN ra.resident r
        LEFT JOIN r.apartment a
        LEFT JOIN a.building b
        WHERE ra.announcement.id = :announcementId
        ORDER BY r.fullName ASC
        """)
    List<RecipientStatusSummary> findRecipientStatusesByAnnouncementId(
        @Param("announcementId") UUID announcementId
    );
    
    List<ResidentAnnouncement> findByAnnouncementId(UUID announcementId);
    
    @Modifying
    @Query("DELETE FROM ResidentAnnouncement ra WHERE ra.announcement.id = :announcementId")
    void deleteByAnnouncementId(@Param("announcementId") UUID announcementId);
}
