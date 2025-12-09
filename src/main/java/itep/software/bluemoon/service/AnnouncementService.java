package itep.software.bluemoon.service;

import itep.software.bluemoon.entity.Announcement;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.entity.person.Staff;
import itep.software.bluemoon.enumeration.AnnouncementTargetType;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementCreateRequestDTO;
import itep.software.bluemoon.model.DTO.announcement.AnnouncementResponseDTO;
import itep.software.bluemoon.repository.AnnouncementRepository;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final StaffRepository staffRepository;
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;

    @Transactional
    public AnnouncementResponseDTO createAnnouncement(AnnouncementCreateRequestDTO request) {
        
        // Validate sender
        Staff sender = staffRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        // Get target residents based on targetType
        List<Resident> receivers = getTargetResidents(request);

        if (receivers.isEmpty()) {
            throw new RuntimeException("No residents found for the specified target");
        }

        // Create announcement
        Announcement announcement = Announcement.builder()
                .title(request.getTitle())
                .message(request.getMessage())
                .sender(sender)
                .receiver(receivers)
                .build();

        Announcement saved = announcementRepository.save(announcement);

        // Update residents' receivedAnnouncements
        for (Resident resident : receivers) {
            resident.getReceivedAnnouncements().add(saved);
        }
        residentRepository.saveAll(receivers);

        // Build response
        return AnnouncementResponseDTO.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .message(saved.getMessage())
                .senderId(saved.getSender().getId())
                .senderName(saved.getSender().getFullName())
                .receiverIds(receivers.stream()
                        .map(Resident::getId)
                        .collect(Collectors.toList()))
                .receiverCount(receivers.size())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    private List<Resident> getTargetResidents(AnnouncementCreateRequestDTO request) {
        AnnouncementTargetType targetType = request.getTargetType();

        return switch (targetType) {
            case ALL -> getAllResidents();
            case BY_BUILDING -> getResidentsByBuilding(request.getBuildingId());
            case BY_FLOOR -> getResidentsByFloor(request.getBuildingId(), request.getFloor());
            case SPECIFIC_RESIDENTS -> getSpecificResidents(request.getResidentIds());
        };
    }

    private List<Resident> getAllResidents() {
        return residentRepository.findAll();
    }

    private List<Resident> getResidentsByBuilding(UUID buildingId) {
        if (buildingId == null) {
            throw new RuntimeException("Building ID is required for BY_BUILDING target type");
        }

        List<Apartment> apartments = apartmentRepository.findByBuildingId(buildingId);
        
        List<Resident> residents = new ArrayList<>();
        for (Apartment apartment : apartments) {
            residents.addAll(apartment.getResidents());
        }
        
        return residents.stream().distinct().collect(Collectors.toList());
    }

    private List<Resident> getResidentsByFloor(UUID buildingId, Integer floor) {
        if (buildingId == null || floor == null) {
            throw new RuntimeException("Building ID and Floor are required for BY_FLOOR target type");
        }

        List<Apartment> apartments = apartmentRepository.findByBuildingIdAndFloor(buildingId, floor);
        
        List<Resident> residents = new ArrayList<>();
        for (Apartment apartment : apartments) {
            residents.addAll(apartment.getResidents());
        }
        
        return residents.stream().distinct().collect(Collectors.toList());
    }

    private List<Resident> getSpecificResidents(List<UUID> residentIds) {
        if (residentIds == null || residentIds.isEmpty()) {
            throw new RuntimeException("Resident IDs are required for SPECIFIC_RESIDENTS target type");
        }

        return residentRepository.findAllById(residentIds);
    }
    
    //Get all 
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDTO> getAllAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc();
        
        return announcements.stream()
                .map(announcement -> AnnouncementResponseDTO.builder()
                        .id(announcement.getId())
                        .title(announcement.getTitle())
                        .message(announcement.getMessage())
                        .senderId(announcement.getSender().getId())
                        .senderName(announcement.getSender().getFullName())
                        .receiverIds(announcement.getReceiver().stream()
                                .map(Resident::getId)
                                .collect(Collectors.toList()))
                        .receiverCount(announcement.getReceiver().size())
                        .createdAt(announcement.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}