package itep.software.bluemoon.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDate;

import itep.software.bluemoon.model.projection.Dropdown;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.User;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.ResidentStatus;
import itep.software.bluemoon.model.DTO.resident.ResidentCreationDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentDetailDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentAccountCreationDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentUpdateDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResidentService {
    private final ResidentRepository residentRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    
    public List<Dropdown> searchForDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return residentRepository.searchForDropdown(keyword.trim());
    }

    public List<ResidentSummary> searchByAllInformation(String keyword, boolean includeInactive){
        return residentRepository.searchGeneral(keyword.trim(), includeInactive);
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

        String phone = dto.getPhone();
        String email = dto.getEmail();
        if(phone != null && email != null){
            User userAccount = exsistResident.getAccount();
            if(userAccount == null) throw new RuntimeException("Resident don't have account");
            userAccount.setPhone(dto.getPhone());
            userAccount.setEmail(dto.getEmail());
        }

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
    
    //tạo tk
    @SuppressWarnings("null")
    public ResidentDetailDTO createAccountForResident(UUID residentId, ResidentAccountCreationDTO dto){
        Resident resident = residentRepository.findById(residentId)
                .orElseThrow(() -> new RuntimeException("Resident not found"));

        if(resident.getAccount() != null){
            throw new RuntimeException("Resident already has an account");
        }

        String generatedUsername = "resident_" + UUID.randomUUID().toString().substring(0, 8);

        User newAccount = User.builder()
                .username(generatedUsername)
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .password("12345")
                .createDate(LocalDate.now())
                .build();

        User savedAccount = userRepository.save(newAccount);
        resident.setAccount(savedAccount);
        Resident savedResident = residentRepository.save(resident);
        
        return EntityToDto.residentToResidentDetailDto(savedResident);
    }
}
