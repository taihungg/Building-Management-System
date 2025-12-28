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
import itep.software.bluemoon.model.DTO.announcement.AnnouncementUpdateRequestDTO;
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
            case BY_BUILDING -> "Toa nha ID: " + request.getBuildingId();
            case BY_FLOOR -> "Toa ID: " + request.getBuildingId() + " - Tang: " + request.getFloors();
            case SPECIFIC_APARTMENTS -> "Gui cho " + (request.getApartmentIds() != null ? request.getApartmentIds().size() : 0) + " can ho cu the";
            case ALL -> "Toan bo cu dan";
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
    
    
    
    //Cập nhật thông báo: Không nhất thiết phải cập nhật đủ 3 trường
    public AnnouncementDetailSummary updateAnnouncement(UUID announcementId, AnnouncementUpdateRequestDTO request) {
        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        
        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            announcement.setTitle(request.getTitle());
        }
        
        if (request.getMessage() != null && !request.getMessage().isEmpty()) {
            announcement.setMessage(request.getMessage());
        }
        
        // Cập nhật targetType và targetDetail
        if (request.getTargetType() != null) {
            announcement.setTargetType(request.getTargetType());
            
            // Nếu ko có targetDetail, tự động gen
            if (request.getTargetDetail() == null || request.getTargetDetail().isEmpty()) {
                String generatedDetail = generateTargetDescriptionForUpdate(request);
                announcement.setTargetDetail(generatedDetail);
            } else {
                announcement.setTargetDetail(request.getTargetDetail());
            }
        } else if (request.getTargetDetail() != null && !request.getTargetDetail().isEmpty()) {
            // Chỉ cập nhật targetDetail nếu có
            announcement.setTargetDetail(request.getTargetDetail());
        }
        
        announcementRepository.save(announcement);
        
        return announcementRepository.findAnnouncementSummaryById(announcementId)
                .orElseThrow(() -> new RuntimeException("Không thể lấy thông tin thông báo đã cập nhật"));
    }
    
    private String generateTargetDescriptionForUpdate(AnnouncementUpdateRequestDTO request) {
        return switch (request.getTargetType()) {
        	case BY_BUILDING -> "Toa nha ID: " + request.getBuildingId();
        	case BY_FLOOR -> "Toa ID: " + request.getBuildingId() + " - Tang: " + request.getFloors();
        	case SPECIFIC_APARTMENTS -> "Gui cho " + (request.getApartmentIds() != null ? request.getApartmentIds().size() : 0) + " can ho cu the";
        	case ALL -> "Toan bo cu dan";
        };
    }

    //Xóa thông báo
    public void deleteAnnouncement(UUID announcementId) {
        if (!announcementRepository.existsById(announcementId)) {
            throw new RuntimeException("Không tìm thấy thông báo");
        }  
        residentAnnouncementRepository.deleteByAnnouncementId(announcementId);
        announcementRepository.deleteById(announcementId);
    }

}