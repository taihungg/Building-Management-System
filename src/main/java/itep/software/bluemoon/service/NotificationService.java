package itep.software.bluemoon.service;

import itep.software.bluemoon.dto.NotificationDTO;
import itep.software.bluemoon.dto.request.CreateNotificationRequest;
import itep.software.bluemoon.dto.request.NotificationFilterRequest;
import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.entity.Notification;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.mapper.NotificationMapper;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.BuildingRepository;
import itep.software.bluemoon.repository.NotificationRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ResidentRepository residentRepository;
    private final BuildingRepository buildingRepository;
    private final ApartmentRepository apartmentRepository;
    private final NotificationMapper notificationMapper;
    private final PushNotificationService pushNotificationService;

    /**
     * Lấy danh sách thông báo với bộ lọc
     */
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(
            UUID recipientId,
            NotificationFilterRequest filter) {

        // Validate sortBy against allowed fields to avoid runtime exception
        List<String> allowedSortFields = Arrays.asList("createdAt", "readAt", "title", "type");
        String sortBy = allowedSortFields.contains(filter.getSortBy()) ? filter.getSortBy() : "createdAt";

        Sort sort = filter.getSortDirection().equalsIgnoreCase("ASC") ?
                Sort.by(sortBy).ascending() :
                Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        // Convert LocalDate to LocalDateTime
        LocalDateTime fromDateTime = filter.getFromDate() != null ?
                filter.getFromDate().atStartOfDay() : null;
        LocalDateTime toDateTime = filter.getToDate() != null ?
                filter.getToDate().atTime(LocalTime.MAX) : null;

        Page<Notification> notifications = notificationRepository.findByFilters(
                recipientId,
                filter.getTypes(),
                filter.getIsRead(),
                fromDateTime,
                toDateTime,
                pageable
        );

        return notifications.map(notificationMapper::toDTO);
    }

    // ... other methods unchanged ...

    /**
     * Xác định danh sách recipients dựa trên request
     * Loại trùng lặp (dedupe) theo resident id
     */
    private List<Resident> determineRecipients(CreateNotificationRequest request) {
        Map<UUID, Resident> recipientsById = new LinkedHashMap<>();

        // Trường hợp 1: Gửi đến một người cụ thể
        if (request.getRecipientId() != null) {
            residentRepository.findById(request.getRecipientId())
                    .ifPresent(r -> recipientsById.put(r.getId(), r));
        }

        // Trường hợp 2: Gửi đến nhiều người cụ thể
        if (request.getRecipientIds() != null && !request.getRecipientIds().isEmpty()) {
            List<Resident> found = residentRepository.findAllById(request.getRecipientIds());
            for (Resident r : found) {
                if (r != null && r.getId() != null) recipientsById.put(r.getId(), r);
            }
        }

        // Trường hợp 3: Gửi đến tất cả residents của một building
        if (request.getBuildingId() != null) {
            buildingRepository.findById(request.getBuildingId())
                    .ifPresent(building -> {
                        for (Apartment apartment : building.getApartments()) {
                            if (apartment.getResidents() != null) {
                                for (Resident r : apartment.getResidents()) {
                                    if (r != null && r.getId() != null) recipientsById.put(r.getId(), r);
                                }
                            }
                        }
                    });
        }

        // Trường hợp 4: Gửi đến tất cả residents của một apartment
        if (request.getApartmentId() != null) {
            apartmentRepository.findById(request.getApartmentId())
                    .ifPresent(apartment -> {
                        if (apartment.getResidents() != null) {
                            for (Resident r : apartment.getResidents()) {
                                if (r != null && r.getId() != null) recipientsById.put(r.getId(), r);
                            }
                        }
                    });
        }

        return new ArrayList<>(recipientsById.values());
    }
}
