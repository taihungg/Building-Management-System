package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.entity.key.ResidentAnnouncementId;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.entity.person.Staff;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.projection.AnnouncementDetailSummary;
import itep.software.bluemoon.model.projection.AnnouncementWithReadStatus;
import itep.software.bluemoon.model.projection.RecipientStatusSummary;
import itep.software.bluemoon.repository.AnnouncementRepository;
import itep.software.bluemoon.repository.ResidentAnnouncementRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.StaffRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ResidentAnnouncementRepository residentAnnouncementRepository;
    private final ResidentRepository residentRepository;
    private final StaffRepository staffRepository;

    @Transactional
    public Announcement createAnnouncement(AnnouncementCreateRequestDTO request) {
        Staff sender = staffRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        
        String description = (request.getTargetDetail() == null || request.getTargetDetail().isEmpty()) 
                             ? generateTargetDescription(request) 
                             : request.getTargetDetail();

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .sender(sender)
                .targetType(request.getTargetType())
                .targetDetail(description)
                .build();
                
        announcement = announcementRepository.save(announcement);
        
        List<Resident> targets = getTargetResidents(request);
        if (targets.isEmpty()) {
            throw new RuntimeException("Không tìm thấy cư dân nào phù hợp với tiêu chí!");
        }
        
        saveInBatches(targets, announcement);
        
        return announcement;
    }

    private List<Resident> getTargetResidents(AnnouncementCreateRequestDTO request) {
        return switch (request.getTargetType()) {
            case BY_BUILDING -> 
                residentRepository.findByBuildingId(request.getBuildingId());
                
            case BY_FLOOR -> 
                residentRepository.findByBuildingAndFloors(request.getBuildingId(), request.getFloors());
                
            case SPECIFIC_APARTMENTS -> 
                residentRepository.findByApartmentIds(request.getApartmentIds());
                
            case ALL -> 
                residentRepository.findAll();
        };
    }

    private String generateTargetDescription(AnnouncementCreateRequestDTO request) {
        return switch (request.getTargetType()) {
            case BY_BUILDING -> "Tòa nhà ID: " + request.getBuildingId();
            case BY_FLOOR -> "Tòa ID: " + request.getBuildingId() + " - Tầng: " + request.getFloors();
            case SPECIFIC_APARTMENTS -> "Gửi cho " + (request.getApartmentIds() != null ? request.getApartmentIds().size() : 0) + " căn hộ cụ thể";
            case ALL -> "Toàn bộ cư dân";
        };
    }

    private void saveInBatches(List<Resident> residents, Announcement announcement) {
        List<ResidentAnnouncement> batchList = new ArrayList<>();
        for (Resident r : residents) {
            ResidentAnnouncement ra = ResidentAnnouncement.builder()
                    .id(new ResidentAnnouncementId(r.getId(), announcement.getId()))
                    .resident(r)
                    .announcement(announcement)
                    .isRead(false)
                    .build();
            batchList.add(ra);
            
            if (batchList.size() >= 500) {
                residentAnnouncementRepository.saveAll(batchList);
                batchList.clear();
            }
        }
        if (!batchList.isEmpty()) {
            residentAnnouncementRepository.saveAll(batchList);
        }
    }
    
    // Resident xem announcements với trạng thái đã đọc
    @Transactional(readOnly = true)
    public List<AnnouncementDetailSummary> getAllAnnouncements() {
        return announcementRepository.findAllAnnouncementSummaries();
    }
    
    @Transactional(readOnly = true)
    public List<AnnouncementWithReadStatus> getResidentAnnouncements(UUID residentId) {
        return residentAnnouncementRepository.findAnnouncementsByResidentId(residentId);
    }

    // Staff xem danh sách người nhận và trạng thái đọc của 1 thông báo
    @Transactional(readOnly = true)
    public List<RecipientStatusSummary> getRecipientStatuses(UUID announcementId) {
        return residentAnnouncementRepository.findRecipientStatusesByAnnouncementId(announcementId);
    }
    
    // Đánh dấu đã đọc
    @Transactional
    public void markAsRead(UUID residentId, UUID announcementId) {
        ResidentAnnouncementId id = new ResidentAnnouncementId(residentId, announcementId);
        
        ResidentAnnouncement ra = residentAnnouncementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo cho cư dân này!"));
        
        ra.setIsRead(true);
        residentAnnouncementRepository.save(ra);
    }
}