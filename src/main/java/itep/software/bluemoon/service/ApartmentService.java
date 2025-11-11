package itep.software.bluemoon.service;

import itep.software.bluemoon.model.projection.ApartmentDropdown;
import itep.software.bluemoon.repository.ApartmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
}
