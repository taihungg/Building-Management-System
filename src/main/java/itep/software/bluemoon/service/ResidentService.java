package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.projection.Dropdown;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.User;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.ResidentStatus;
import itep.software.bluemoon.model.DTO.resident.ResidentCreationDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentDetailDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentUpdateDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResidentService {
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;

    public List<Dropdown> searchForDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return residentRepository.searchForDropdown(keyword.trim());
    }

    public List<ResidentSummary> searchByAllInformation(String keyword, boolean includeInactive){
        if (keyword != null && !keyword.isBlank()) {
            return residentRepository.searchGeneral(keyword.trim(), includeInactive);
        } else {
            return residentRepository.findAllSummary();
        }
    }

    @SuppressWarnings("null")
    public ResidentDetailDTO getResidentDetail(UUID id){
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        return EntityToDto.residentToResidentDetailDto(resident);
    }

    @SuppressWarnings("null")
    public Resident createResident(ResidentCreationDTO dto){
        Apartment apartment = apartmentRepository.findById(dto.getApartmentID())
                .orElseThrow(() -> new RuntimeException("Apartment not found"));

        return residentRepository.save(
                Resident.builder()
                .fullName(dto.getFullName())
                .idCard(dto.getIdCard())
                .dob(dto.getDob())
                .homeTown(dto.getHomeTown())
                .apartment(apartment)
                .build()
        );
    }

    @SuppressWarnings("null")
    public Resident updateResident(UUID id, ResidentUpdateDTO dto){
        Resident exsistResident = residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        if(dto.getFullName() != null) exsistResident.setFullName(dto.getFullName());
        if(dto.getIdCard() != null) exsistResident.setIdCard(dto.getIdCard());
        if(dto.getDob() != null) exsistResident.setDob(dto.getDob());
        if(dto.getHomeTown() != null) exsistResident.setHomeTown(dto.getHomeTown());

        User userAccount = exsistResident.getAccount();
        if(userAccount == null) throw new RuntimeException("Resident don't have account");
        if(dto.getPhone() != null) userAccount.setPhone(dto.getPhone());
        if(dto.getEmail() != null) userAccount.setEmail(dto.getEmail());

        return residentRepository.save(exsistResident);
    }

    @SuppressWarnings("null")
    public void changeResidentToInactive(UUID id){
        Resident existResident = residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        existResident.setStatus(ResidentStatus.INACTIVE);

        if (existResident.getApartment() != null) {
            existResident.getApartment().getResidents().remove(existResident);
            existResident.setApartment(null);
        }

        residentRepository.save(existResident);
    }

    //WARNING: this method will clear all relative information
    @SuppressWarnings("null")
    public void deleteResident(UUID id){
        residentRepository.deleteById(id);
    }
}
