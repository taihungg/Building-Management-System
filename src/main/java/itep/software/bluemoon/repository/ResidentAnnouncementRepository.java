package itep.software.bluemoon.repository;

import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.model.DTO.announcement.ResidentAnnouncementResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResidentAnnouncementRepository extends JpaRepository<ResidentAnnouncement, UUID> {


    @Query("""
    	   SELECT new itep.software.bluemoon.model.DTO.announcement.ResidentAnnouncementResponseDTO
           (a.id, a.title, a.message, s.fullName, a.createdAt, ra.isRead)
           FROM ResidentAnnouncement ra
           JOIN ra.announcement a
           JOIN a.sender s
           WHERE ra.resident.id = :residentId
           ORDER BY a.createdAt DESC"
    		""")
    List<ResidentAnnouncementResponseDTO> findAllByResidentId(@Param("residentId") UUID residentId);
}