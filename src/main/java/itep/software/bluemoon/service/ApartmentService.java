package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.enumeration.IssueStatus;
import itep.software.bluemoon.model.DTO.apartment.ApartmentCreationDTO;
import itep.software.bluemoon.model.DTO.apartment.ApartmentDetailDTO;
import itep.software.bluemoon.model.DTO.apartment.ApartmentResidentUpdateDTO;
import itep.software.bluemoon.model.projection.ApartmentSummary;
import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.BuildingRepository;
import itep.software.bluemoon.repository.InvoiceRepository;
import itep.software.bluemoon.repository.IssueRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;
    private final BuildingRepository buildingRepository;
    private final InvoiceRepository invoiceRepository;
    private final IssueRepository issueRepository;
    private final VehicleRepository vehicleRepository;

    public List<Dropdown> searchApartmentDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return apartmentRepository.searchForDropdown(keyword.trim());
    }

    public List<ApartmentSummary> searchByAllInformation(String keyword, UUID buildingId, Integer floor){
        keyword = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        
        return apartmentRepository.searchGeneral(keyword, buildingId, floor);
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
                .numberOfResidents(residentRepository.countByApartment_Id(id))
                .build();

        ApartmentDetailDTO.OwnerInfoDTO owner = ApartmentDetailDTO.OwnerInfoDTO.builder()
                .id(apartment.getOwner().getId())
                .fullName(apartment.getOwner().getFullName())
                .phone(apartment.getOwner().getPhone())
                .email(apartment.getOwner().getEmail())
                .build();

        List<ResidentSummary> residents = residentRepository.findByApartment_Id(id);

        int unpaidInvoicesCount = invoiceRepository.countByApartment_IdAndStatusIn(id, List.of(
                InvoiceStatus.UNPAID,
                InvoiceStatus.PARTIAL,
                InvoiceStatus.OVERDUE
        ));

        int vehicleCount = vehicleRepository.countByOwner_Apartment_Id(id);

        int pendingIssuesCount = issueRepository.countByApartment_IdAndStatusIn(id, List.of(
                IssueStatus.PROCESSING,
                IssueStatus.UNPROCESSED
        ));

        ApartmentDetailDTO.SummaryDTO summary = ApartmentDetailDTO.SummaryDTO.builder()
                .unpaidInvoicesCount(unpaidInvoicesCount)
                .vehicleCount(vehicleCount)
                .pendingIssuesCount(pendingIssuesCount)
                .build();

        return ApartmentDetailDTO.builder()
                .id(apartment.getId())
                .info(info)
                .owner(owner)
                .residents(residents)
                .summary(summary)
                .build();
    }

    @SuppressWarnings("null")
    public ApartmentDetailDTO createApartment(ApartmentCreationDTO dto){
        Building building = buildingRepository.findById(dto.getBuildingId())
                    .orElseThrow(() -> new RuntimeException("Apartment must be in an existing building!"));
        Resident owner = dto.getOwnerId() != null
                ? residentRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Resident not found!"))
                : null;

        Apartment newApartment = apartmentRepository.save(Apartment.builder()
                .roomNumber(dto.getRoomNumber())
                .floor(dto.getFloor())
                .area(dto.getArea())
                .building(building)
                .owner(owner)
                .build());

        return getApartmentDetail(newApartment.getId());
    }

    @SuppressWarnings("null")
    public void changeApartmentOwner(UUID apartmentId, UUID ownerId){
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        Resident newOwner = ownerId != null
                ? residentRepository.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Resident not found!"))
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

        if (invoiceRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be deleted: This apartment has invoices!");
        }

        if (issueRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be  deleted: This apartment has issues!");
        }

        apartmentRepository.delete(apartment);
    }

    
    
    // Thêm một danh sách cư dân vào căn hộ
    @SuppressWarnings("null")
    public ApartmentDetailDTO addResidentsToApartment(UUID apartmentId, ApartmentResidentUpdateDTO dto){
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        List<Resident> residentsToUpdate = residentRepository.findAllById(dto.getResidentIds());

        if (residentsToUpdate.size() != dto.getResidentIds().size()) {
            throw new RuntimeException("One or more residents not found!");
        }

        for (Resident resident : residentsToUpdate) {
            resident.setApartment(apartment);
        }

        residentRepository.saveAll(residentsToUpdate);

        return getApartmentDetail(apartmentId);
    }
    
    // Xóa một danh sách cư dân khỏi căn hộ 
    @SuppressWarnings("null")
    public ApartmentDetailDTO removeResidentsFromApartment(UUID apartmentId, ApartmentResidentUpdateDTO dto){
        apartmentRepository.findById(apartmentId)
            .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        List<Resident> residentsToUpdate = residentRepository.findAllById(dto.getResidentIds());

        if (residentsToUpdate.size() != dto.getResidentIds().size()) {
            throw new RuntimeException("One or more residents not found!");
        }

        for (Resident resident : residentsToUpdate) {
            if (resident.getApartment() == null || !resident.getApartment().getId().equals(apartmentId)) {
                throw new RuntimeException("Resident " + resident.getId() + " is not currently in this apartment!");
            }
            resident.setApartment(null);
        }

        residentRepository.saveAll(residentsToUpdate);

        return getApartmentDetail(apartmentId);
    }
}
