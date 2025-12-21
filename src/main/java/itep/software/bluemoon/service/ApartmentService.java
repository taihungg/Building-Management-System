package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.InvoiceStatus;
import itep.software.bluemoon.model.DTO.apartment.ApartmentCreationDTO;
import itep.software.bluemoon.model.DTO.apartment.ApartmentResidentUpdateDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.*;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.model.DTO.apartment.ApartmentDetailDTO;
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
    private final InvoiceRepository invoiceRepository;
    private final IssueRepository issueRepository;

    public List<Dropdown> searchApartmentDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return apartmentRepository.searchForDropdown(keyword.trim());
    }

    public List<ApartmentSummary> searchByAllInformation(String keyword, UUID buildingId, Integer floor){
        return apartmentRepository.searchGeneral(keyword.trim(), buildingId, floor);
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

        List<ResidentSummary> residents = residentRepository.findByApartment_Id(apartment.getId());

        int unpaidInvoicesCount = invoiceRepository.countByApartment_IdAndStatusIn(apartment.getId(), List.of(
                InvoiceStatus.UNPAID,
                InvoiceStatus.PARTIAL,
                InvoiceStatus.OVERDUE
        ));
        ApartmentDetailDTO.SummaryDTO summary = ApartmentDetailDTO.SummaryDTO.builder()
                .unpaidInvoicesCount(unpaidInvoicesCount)
                .pendingIssuesCount(unpaidInvoicesCount)
                .vehicleCount(unpaidInvoicesCount)
                .build();

        return ApartmentDetailDTO.builder()
                .id(apartment.getId())
                .info(info)
                .owner(owner)
                .residents(residents)
                .summary(summary)
                .build();
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

        if (invoiceRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be deleted: This apartment has invoices!");
        }

        if (issueRepository.existsByApartment_Id(id)) {
            throw new RuntimeException("Cannot be  deleted: This apartment has issues!");
        }

        apartmentRepository.delete(apartment);
    }

    
    
    // Thêm Residents vào căn hộ
    public void addResidentsToApartment(UUID apartmentId, ApartmentResidentUpdateDTO dto){
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        List<Resident> residentsToUpdate = residentRepository.findAllById(dto.getResidentIds());

        if (residentsToUpdate.size() != dto.getResidentIds().size()) {
            throw new RuntimeException("One or more residents not found!");
        }

        for (Resident resident : residentsToUpdate) {
            // Gán căn hộ mới 
            resident.setApartment(apartment);
            //Resident có thể đã có Apartment cũ => cập nhật
        }

        residentRepository.saveAll(residentsToUpdate);
    }
    
     // Xóa .... 
    public void removeResidentsFromApartment(UUID apartmentId, ApartmentResidentUpdateDTO dto){
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found!"));

        List<Resident> residentsToUpdate = residentRepository.findAllById(dto.getResidentIds());

        if (residentsToUpdate.size() != dto.getResidentIds().size()) {
            throw new RuntimeException("One or more residents not found!");
        }

        for (Resident resident : residentsToUpdate) {
            if (resident.getApartment() == null || !resident.getApartment().getId().equals(apartmentId)) {
                throw new RuntimeException("Resident " + resident.getId() + " is not currently in this apartment!");
            }

            // Nếu cư dân là chủ hộ => hủy quyền chủ hộ
            if (apartment.getOwner() != null && apartment.getOwner().getId().equals(resident.getId())) {
                apartment.setOwner(null);
                apartmentRepository.save(apartment); 
            }
            resident.setApartment(null);
        }

        residentRepository.saveAll(residentsToUpdate);
    }
}
