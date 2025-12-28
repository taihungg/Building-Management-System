package itep.software.bluemoon.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.model.projection.AnnouncementDetailSummary;
import itep.software.bluemoon.model.projection.AnnouncementSummary;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, UUID> {
    
    // Staff xem tất cả announcements với projection
    @Query("""
        SELECT a.id as id,
               a.title as title,
               a.message as message,
               s.fullName as senderName,
               a.targetType as targetType,
               a.targetDetail as targetDetail,
               a.createdDate as createdDate
        FROM Announcement a
        JOIN a.sender s
        ORDER BY a.createdDate DESC
        """)
    List<AnnouncementDetailSummary> findAllAnnouncementSummaries();
    
    // Resident xem announcements của mình
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
    
 // Trong AnnouncementRepository thêm:
    @Query("""
        SELECT a.id as id,
               a.title as title,
               a.message as message,
               s.fullName as senderName,
               a.targetType as targetType,
               a.targetDetail as targetDetail,
               a.createdDate as createdDate
        FROM Announcement a
        JOIN a.sender s
        WHERE a.id = :id
        """)
    Optional<AnnouncementDetailSummary> findAnnouncementSummaryById(@Param("id") UUID id);
}