package itep.software.bluemoon.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.entity.User;
import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.enumeration.ResidentStatus;
import itep.software.bluemoon.model.DTO.resident.ResidentAccountCreationDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentCreationDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentDetailDTO;
import itep.software.bluemoon.model.DTO.resident.ResidentUpdateDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import itep.software.bluemoon.repository.PersonRepository;
import itep.software.bluemoon.repository.ResidentRepository;
import itep.software.bluemoon.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResidentService {
    private final PersonRepository personRepository;
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
        if (personRepository.existsByIdCard(dto.getIdCard())) {
            throw new IllegalArgumentException("ID Card exists: " + dto.getIdCard());
        }
        if (dto.getEmail() != null && personRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email exists: " + dto.getEmail());
        }
        if (dto.getPhone() != null && personRepository.existsByPhone(dto.getPhone())) {
            throw new IllegalArgumentException("Phone exists: " + dto.getPhone());
        }

        Apartment apartment = null;
        if (dto.getApartmentID() != null) {
            apartment = apartmentRepository.findById(dto.getApartmentID())
                    .orElseThrow(() -> new IllegalArgumentException("Apartment not found: " + dto.getApartmentID()));
        }
        
        return residentRepository.save(
                Resident.builder()
                .fullName(dto.getFullName())
                .idCard(dto.getIdCard())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dob(dto.getDob())
                .homeTown(dto.getHomeTown())
                .status(dto.getStatus())
                .apartment(apartment)
                .build()
        );
    }

    @SuppressWarnings("null")
    public Resident updateResident(UUID id, ResidentUpdateDTO dto) {
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resident not found: " + id));

        if (dto.getIdCard() != null && !dto.getIdCard().equals(resident.getIdCard())) {
            if (personRepository.existsByIdCard(dto.getIdCard())) {
                throw new IllegalArgumentException("ID Card is used by other people: " + dto.getIdCard());
            }
            resident.setIdCard(dto.getIdCard());
        }

        if (dto.getEmail() != null && !dto.getEmail().equals(resident.getEmail())) {
            if (personRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Email is used by other people: " + dto.getEmail());
            }
            resident.setEmail(dto.getEmail());
        }

        if (dto.getPhone() != null && !dto.getPhone().equals(resident.getPhone())) {
            if (personRepository.existsByPhone(dto.getPhone())) {
                throw new IllegalArgumentException("Phone is used by other people: " + dto.getPhone());
            }
            resident.setPhone(dto.getPhone());
        }

        resident.setFullName(dto.getFullName());
        resident.setDob(dto.getDob());
        resident.setHomeTown(dto.getHomeTown());
        
        if (dto.getStatus() != null) {
            if (dto.getStatus().equals(ResidentStatus.INACTIVE)) {
                throw new IllegalArgumentException("Can not change status to INACTIVE");
            }
            resident.setStatus(dto.getStatus());
        }

        return residentRepository.save(resident);
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
