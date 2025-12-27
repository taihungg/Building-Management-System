package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.entity.key.ResidentAnnouncementId;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.entity.person.Staff;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.RecipientStatusResponseDTO;
import itep.software.bluemoon.repository.AnnouncementRepository;
import itep.software.bluemoon.repository.ResidentAnnouncementRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.StaffRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ResidentAnnouncementRepository residentAnnouncementRepository;
    private final ResidentRepository residentRepository;
    private final StaffRepository staffRepository;

    @SuppressWarnings("null")
    @Transactional
    public void createAnnouncement(AnnouncementCreateRequestDTO request) {
        Staff sender = staffRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
        
        // Tự động tạo mô tả cho targetDetail
        String description = (request.getTargetDetail() == null || request.getTargetDetail().isEmpty()) 
                             ? generateTargetDescription(request) 
                             : request.getTargetDetail();

        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .sender(sender)
                .targetType(request.getTargetType())
                .targetDetail(description) // Lưu mô tả dễ đọc vào DB
                .build();
                
        announcement = announcementRepository.save(announcement);
        
        List<Resident> targets = getTargetResidents(request);
        if (targets.isEmpty()) {
            throw new RuntimeException("Không tìm thấy cư dân nào phù hợp với tiêu chí!");
        }
        
        saveInBatches(targets, announcement);
    }

    private List<Resident> getTargetResidents(AnnouncementCreateRequestDTO request) {
        return switch (request.getTargetType()) {
            case BY_BUILDING -> 
                residentRepository.findByBuildingId(request.getBuildingId());
                
            case BY_FLOOR -> 
                // Gọi hàm xử lý danh sách tầng mới
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
    
    
    public Page<AnnouncementResponseDTO> getResidentAnnouncements(UUID residentId, Pageable pageable) {
        return residentAnnouncementRepository.findByResidentId(residentId, pageable);
    }
    
    
    /*
     * Staff xem danh sách thông báo
     */
    
   // Staff xem toàn bộ danh sách thông báo đã gửi
    public Page<Announcement> getAllAnnouncements(Pageable pageable) {
        return announcementRepository.findAllWithSender(pageable);
    }

    // Staff xem danh sách người nhận và trạng thái đọc của 1 thông báo
    public List<RecipientStatusResponseDTO> getRecipientStatuses(UUID announcementId) {
        List<ResidentAnnouncement> recipients = residentAnnouncementRepository
                .findByAnnouncementIdWithDetails(announcementId); // ← ĐÂY NÈ!
        
        return recipients.stream().map(ra -> {
            Resident resident = ra.getResident();
            Integer roomNumber = null;
            String buildingName = "N/A";
            
            if (resident.getApartment() != null) {
                roomNumber = resident.getApartment().getRoomNumber();
                if (resident.getApartment().getBuilding() != null) {
                    buildingName = resident.getApartment().getBuilding().getName();
                }
            }
            
            return RecipientStatusResponseDTO.builder()
                    .residentName(resident.getFullName())
                    .roomNumber(roomNumber)
                    .buildingName(buildingName)
                    .isRead(ra.getIsRead())
                    .build();
                    
        }).collect(Collectors.toList());
    }
    
    
    /*
     * Đánh dấu đã đọc
     */
    @Transactional
    public void markAsRead(UUID residentId, UUID announcementId) {
        ResidentAnnouncementId id = new ResidentAnnouncementId(residentId, announcementId);
        
        ResidentAnnouncement ra = residentAnnouncementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo cho cư dân này!"));
        
        // Cập nhậy
        ra.setIsRead(true);
        residentAnnouncementRepository.save(ra);

    }
}
    
