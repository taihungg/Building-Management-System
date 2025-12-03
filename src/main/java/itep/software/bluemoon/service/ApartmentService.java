package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.ApartmentCreationDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.repository.*;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.model.DTO.ApartmentDetailDTO;
import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.model.projection.ApartmentSummary;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;
    private final BuildingRepository buildingRepository;
    private final BillRepository billRepository;
    private final IssueRepository issueRepository;

    public List<Dropdown> searchApartmentDropdown(String keyword){
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

        return EntityToDto.apartmentToApartmentDetailDto(apartment, residentRepository);
    }

    public Apartment createResident(ApartmentCreationDTO dto){
        Building building = buildingRepository.findById(dto.getBuildingId())
                    .orElseThrow(() -> new RuntimeException("Building not found!"));
        Resident owner = dto.getOwnerId() != null
                ? residentRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Owner not found!"))
                : null;

        return apartmentRepository.save(
                Apartment.builder()
                        .roomNumber(dto.getRoomNumber())
                        .floor(dto.getFloor())
                        .area(dto.getArea())
                        .building(building)
                        .owner(owner)
                        .build()
        );
    }

    public void changeApartmentOwner(UUID apartmentId, UUID ownerId){
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        Resident newOwner = ownerId != null
                ? residentRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found!"))
                : null;

        apartment.setOwner(newOwner);

        apartmentRepository.save(apartment);
    }

    //Only able to delete if there is no information
    @SuppressWarnings("null")
    public void deleteApartment(UUID id){
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        if (residentRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be deleted: This apartment has residents!");
        }

        if (billRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be deleted: This apartment has bills!");
        }

        if (issueRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be  deleted: This apartment has issues!");
        }

        apartmentRepository.delete(apartment);
    }
}
