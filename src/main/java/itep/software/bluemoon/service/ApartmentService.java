package itep.software.bluemoon.service;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.repository.ApartmentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;

    public List<Apartment> getAllApartments() {
        return apartmentRepository.findAll();
    }

    public Optional<Apartment> getApartmentById(UUID id) {
        return apartmentRepository.findById(id);
    }

    public Apartment createApartment(Apartment apartment) {
        // if (apartmentRepository.findByName(apartment.getName()).isPresent()) {
        //    throw new RuntimeException("Apartment name already exists");
        // }
        return apartmentRepository.save(apartment);
    }

    public Apartment updateApartment(UUID id, Apartment apartmentDetails) {
        Apartment existingApartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found with id: " + id));

        return apartmentRepository.save(existingApartment);
    }

    public void deleteApartment(UUID id) {
        if (!apartmentRepository.existsById(id)) {
            throw new RuntimeException("Apartment not found with id: " + id);
        }
        apartmentRepository.deleteById(id);
    }
}
