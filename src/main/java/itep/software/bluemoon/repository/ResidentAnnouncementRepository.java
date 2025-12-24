package itep.software.bluemoon.repository;

import java.util.UUID;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable; 
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.entity.key.ResidentAnnouncementId;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;

@Repository
public interface ResidentAnnouncementRepository extends JpaRepository<ResidentAnnouncement, ResidentAnnouncementId> {
    
    @Query("SELECT new itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO(" +
           "a.id, a.title, a.message, s.fullName, a.createdAt, ra.isRead) " +
           "FROM ResidentAnnouncement ra " +
           "JOIN ra.announcement a " +
           "JOIN a.sender s " +
           "WHERE ra.id.residentId = :residentId " +
           "ORDER BY a.createdAt DESC")
    Page<AnnouncementResponseDTO> findByResidentId(UUID residentId, Pageable pageable);
    
    @Query("SELECT ra FROM ResidentAnnouncement ra " +
            "JOIN FETCH ra.resident r " +
            "LEFT JOIN FETCH r.apartment a " +
            "LEFT JOIN FETCH a.building " +
            "WHERE ra.announcement.id = :announcementId")
     List<ResidentAnnouncement> findByAnnouncementIdWithDetails(UUID announcementId);
    
    List<ResidentAnnouncement> findByAnnouncementId(UUID announcementId);
}