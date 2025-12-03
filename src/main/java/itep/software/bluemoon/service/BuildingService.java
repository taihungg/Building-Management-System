package itep.software.bluemoon.service;

import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.repository.BuildingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
}
