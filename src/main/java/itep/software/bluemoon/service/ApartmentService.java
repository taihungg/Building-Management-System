package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.model.DTO.ApartmentDetailDTO;
import itep.software.bluemoon.model.projection.ApartmentDropdown;
import itep.software.bluemoon.model.projection.ApartmentSummary;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;

    public List<ApartmentDropdown> searchApartmentDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return apartmentRepository.searchForDropdown(keyword.trim());
    }

    public List<ApartmentSummary> searchByAllInformation(String keyword, UUID buildingId, Integer floor){
        keyword = keyword != null && !keyword.isBlank() ? keyword.trim() : null;

        if(keyword != null || buildingId != null || floor != null) {
            return apartmentRepository.searchGeneral(keyword, buildingId, floor);
        } else {
            return apartmentRepository.findAllSummary();
        }
    }

    @SuppressWarnings("null")
    public ApartmentDetailDTO getApartmentDetail(UUID id){
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        ApartmentDetailDTO.ApartmentInfoDTO info = ApartmentDetailDTO.ApartmentInfoDTO.builder()
            .roomNumber(apartment.getRoomNumber())
            .floor(apartment.getFloor())
            .area(apartment.getArea())
            .buildingName(apartment.getBuilding().getName())
            .numberOfResidents(apartment.getResidents().size())
            .build();
            
        ApartmentDetailDTO.OwnerInfoDTO owner = ApartmentDetailDTO.OwnerInfoDTO.builder()
            .id(apartment.getOwner().getId())
            .fullName(apartment.getOwner().getFullName())
            .phoneNumber(apartment.getOwner().getAccount().getPhone())
            .email(apartment.getOwner().getAccount().getEmail())
            .build();

        List<ResidentSummary> residents = residentRepository.findByApartment_Id(id);

        ApartmentDetailDTO.SummaryDTO summary = ApartmentDetailDTO.SummaryDTO.builder()
            .build();

        return ApartmentDetailDTO.builder()
            .id(id)
            .info(info)
            .owner(owner)
            .residents(residents)
            .summary(summary)
            .build();
    }
}
