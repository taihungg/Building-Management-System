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

    @Transactional
    public void createAnnouncement(AnnouncementCreateRequestDTO request) {
    	Staff sender = staffRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên"));
    	
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .sender(sender)
                .targetType(request.getTargetType())
                .targetDetail(request.getTargetDetail()) 
                .build();
        announcement = announcementRepository.save(announcement);
        
        List<Resident> targets = getTargetResidents(request);
        if (targets.isEmpty()) {
            throw new RuntimeException("Không tìm thấy cư dân nào phù hợp với tiêu chí!");
        }
        saveInBatches(targets, announcement);
    }

    private List<Resident> getTargetResidents(AnnouncementCreateRequestDTO request) {
        String detail = request.getTargetDetail();
        
        try {
            return switch (request.getTargetType()) {
                case BY_BUILDING -> residentRepository.findByBuildingName(detail);
                
                case BY_FLOOR -> {
                    String[] parts = detail.split("-");
                    if (parts.length < 2) throw new IllegalArgumentException("Định dạng tầng sai (VD: 12 - Block A)");
                    int floor = Integer.parseInt(parts[0].trim()); //
                    String buildingName = parts[1].trim(); //
                    yield residentRepository.findByFloorAndBuildingName(floor, buildingName);
                }
                
                case SPECIFIC_APARTMENTS -> {
                    String[] parts = detail.split("-"); 
                    if (parts.length < 2) throw new IllegalArgumentException("Định dạng căn hộ sai (VD: 101, 102 - Block A)");

                    List<Integer> roomNumbers = Arrays.stream(parts[0].split(","))
                            .map(String::trim)
                            .map(Integer::parseInt) 
                            .toList();

                    String buildingName = parts[1].trim(); 
                    yield residentRepository.findByRoomNumbersAndBuilding(roomNumbers, buildingName);
                }
                default -> residentRepository.findAll(); 
            };
        } catch (NumberFormatException e) {
            throw new RuntimeException("Lỗi nhập liệu: Số phòng hoặc số tầng phải là chữ số!");
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(e.getMessage());
        }
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
        return announcementRepository.findAll(pageable);
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
    