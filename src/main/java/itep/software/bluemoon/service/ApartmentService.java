package itep.software.bluemoon.service;

import itep.software.bluemoon.model.projection.ApartmentDropdown;
import itep.software.bluemoon.model.projection.ApartmentSummary;
import itep.software.bluemoon.repository.ApartmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ApartmentService {
    private final ApartmentRepository apartmentRepository;

    public List<ApartmentDropdown> searchApartmentDropdown(String keyword){
        if(keyword == null || keyword.isBlank()) {
            return new ArrayList<>();
        }

        return apartmentRepository.searchForDropdown(keyword.trim());
    }

    public List<ApartmentSummary>  searchByAllInformation(String keyword, UUID buildingId, Integer floor){
        keyword = keyword != null && !keyword.isBlank() ? keyword.trim() : null;

        if(keyword != null || buildingId != null || floor != null) {
            return apartmentRepository.searchGeneral(keyword, buildingId, floor);
        } else {
            return apartmentRepository.findAllSummary();
        }
    }
}
