package itep.software.bluemoon.service;

import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.repository.BuildingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.entity.Building;
import itep.software.bluemoon.model.DTO.apartment.BuildingCreationDTO;
import itep.software.bluemoon.model.DTO.apartment.BuildingDetailDTO;

@Service
@RequiredArgsConstructor
@Transactional
public class BuildingService {
    private final BuildingRepository buildingRepository;

    public List<Dropdown> searchForDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return buildingRepository.searchForDropdown(keyword.trim());
    }

    @SuppressWarnings("null")
    public void createBuilding(BuildingCreationDTO dto){
        if(dto.getName() == null){
            throw new IllegalArgumentException("Required name not null!");
        }
        Building newBuilding = Building.builder().name(dto.getName()).build();
        buildingRepository.save(newBuilding);
    }

    @SuppressWarnings("null")
    public void deleteBuilding(UUID id){
        buildingRepository.deleteById(id);
    }
}
