package itep.software.bluemoon.service;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.projection.ResidentSummary;
import org.springframework.stereotype.Service;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.ResidentDetailDTO;
import itep.software.bluemoon.model.mapper.EntityToDto;
import itep.software.bluemoon.repository.ResidentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResidentService {
    private final ResidentRepository residentRepository;

    public List<ResidentSummary> searchByAllInformation(String keyword){
        if (keyword != null && !keyword.isBlank()) {
            return  residentRepository.searchGeneral(keyword.trim());
        } else {
            return  residentRepository.findAllSummary();
        }
    }

    public ResidentDetailDTO getResidentDetail(UUID id){
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resident not found"));
        return EntityToDto.residentToResidentDetailDto(resident);
    }
}
