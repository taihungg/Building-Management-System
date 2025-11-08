package itep.software.bluemoon.service;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.DTO.ResidentDetailDTO;
import itep.software.bluemoon.model.DTO.ResidentSummaryDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.repository.ResidentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResidentService {
    private final ResidentRepository residentRepository;

    public List<ResidentSummaryDTO> searchByAllInformation(String keyword){
        List<Resident> entities;
        
        if (keyword != null && !keyword.isBlank()) {
            entities = residentRepository.searchGeneral(keyword.trim());
        } else {
            entities = residentRepository.findAll();
        }

        return entities.stream()
                .map(EntityToDto::residentSummaryDTOToDto)
                .toList();
    }

    public ResidentDetailDTO getResidentGetail(UUID id){
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));
        return EntityToDto.residentDetailToDto(resident);
    }
}
