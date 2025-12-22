package itep.software.bluemoon.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.entity.ResidentAnnouncement;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.entity.person.Staff;
import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.RecipientResponseDTO;
import itep.software.bluemoon.model.DTO.announcement.ResidentAnnouncementResponseDTO;
import itep.software.bluemoon.repository.AnnouncementRepository;
import itep.software.bluemoon.repository.ResidentAnnouncementRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.StaffRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final StaffRepository staffRepository;
    private final ResidentRepository residentRepository;
    private final ResidentAnnouncementRepository residentAnnouncementRepository;

    // --- 1. Táº O THÃ”NG BÃO ---
    @Transactional
    public AnnouncementResponseDTO createAnnouncement(AnnouncementCreateRequestDTO request) {

        Staff sender = staffRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Láº¥y danh sÃ¡ch cÆ° dÃ¢n nháº­n tin
        List<Resident> receivers = getTargetResidents(request);
        if (receivers.isEmpty()) {
            throw new RuntimeException("No active residents found for the specified target");
        }

        // chuá»—i mÃ´ táº£ (VD: "Táº§ng 5", "TÃ²a A")
        String detailString = buildTargetDetailString(request);


        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .sender(sender)
                .targetType(request.getTargetType()) 
                .targetDetail(detailString)       
                .build();
        
        Announcement savedAnnouncement = announcementRepository.save(announcement);


        List<ResidentAnnouncement> residentAnnouncements = receivers.stream()
                .map(resident -> ResidentAnnouncement.builder()
                        .resident(resident)
                        .announcement(savedAnnouncement)
                        .isRead(false)
                        .build())
                .collect(Collectors.toList());

        residentAnnouncementRepository.saveAll(residentAnnouncements);

        return AnnouncementResponseDTO.builder()
                .id(savedAnnouncement.getId())
                .title(savedAnnouncement.getTitle())
                .message(savedAnnouncement.getMessage())
                .senderName(sender.getFullName())
                .createdAt(savedAnnouncement.getCreatedAt())
                .targetType(request.getTargetType().name())
                .targetDetail(detailString)
                .receiverCount((long) receivers.size())
                .build();
    }

    // Láº¤Y DANH SÃCH TÃ“M Táº®T (Cho Staff) ---
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDTO> getAllAnnouncementsSummary() {
        return announcementRepository.findAllSummary();
    }

    // Láº¤Y DANH SÃCH NGÆ¯á»œI NHáº¬N CHI TIáº¾T (Khi Staff báº¥m vÃ o xem) ---
    @Transactional(readOnly = true)
    public List<RecipientResponseDTO> getRecipientsByAnnouncement(UUID announcementId) {
        if (!announcementRepository.existsById(announcementId)) {
            throw new RuntimeException("Announcement not found");
        }
        return residentAnnouncementRepository.findRecipientsByAnnouncementId(announcementId);
    }

    // Láº¤Y THÃ”NG BÃO Cá»¦A CÆ¯ DÃ‚N
    @Transactional(readOnly = true)
    public List<ResidentAnnouncementResponseDTO> getAnnouncementsForResident(UUID residentId) {
        if (!residentRepository.existsById(residentId)) {
            throw new RuntimeException("Resident not found");
        }
        return residentAnnouncementRepository.findAllByResidentId(residentId);
    }


    private List<Resident> getTargetResidents(AnnouncementCreateRequestDTO request) {
        UUID buildingId = null;
        Integer floor = null;
        List<UUID> apartmentIds = null;

        switch (request.getTargetType()) {
            case ALL -> {} 
            case BY_BUILDING -> {
                if (request.getBuildingId() == null) throw new RuntimeException("Missing Building ID");
                buildingId = request.getBuildingId();
            }
            case BY_FLOOR -> {
                if (request.getBuildingId() == null || request.getFloor() == null) 
                    throw new RuntimeException("Missing Building ID or Floor");
                buildingId = request.getBuildingId();
                floor = request.getFloor();
            }
            case SPECIFIC_APARTMENTS -> {
                if (request.getApartmentIds() == null || request.getApartmentIds().isEmpty())
                    throw new RuntimeException("Missing Apartment IDs");
                apartmentIds = request.getApartmentIds();
            }
        }
        return residentRepository.findActiveResidentsByFilters(buildingId, floor, apartmentIds);
    }


    private String buildTargetDetailString(AnnouncementCreateRequestDTO request) {
        if (request.getTargetType() == null) return "Unknown";
        
        switch (request.getTargetType()) {
            case ALL:
                return "ToÃ n bá»™ cÆ° dÃ¢n";
            case BY_BUILDING:
                return "TÃ²a nhÃ : " + request.getBuildingId(); 
            case BY_FLOOR:
                return "Táº§ng " + request.getFloor(); 
            case SPECIFIC_APARTMENTS:
                return "CÄƒn há»™ cá»¥ thá»ƒ (" + request.getApartmentIds().size() + " cÄƒn)";
            default:
                return "KhÃ¡c";
        }
    }
}