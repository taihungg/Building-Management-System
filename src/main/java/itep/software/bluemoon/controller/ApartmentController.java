package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.entity.Apartment;
import itep.software.bluemoon.model.DTO.apartment.ApartmentCreationDTO;
import itep.software.bluemoon.model.projection.ApartmentSummary;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import itep.software.bluemoon.model.DTO.apartment.ApartmentDetailDTO;
import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.ApartmentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/apartments")
@RequiredArgsConstructor
public class ApartmentController {
    private final ApartmentService apartmentService;

    //use this api to get basic list apartment to make UUID apartment input
    @GetMapping("/dropdown")
    public ResponseEntity<Object> searchForDropdown(@RequestParam("keyword") String keyword) {
        List<Dropdown> data = apartmentService.searchApartmentDropdown(keyword);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get dropdown apartment successfully!",
                data
        );
    }

    @GetMapping
    public ResponseEntity<Object> searchByAllInformation(@RequestParam(value = "keyword", required = false) String keyword,
                                                         @RequestParam(value = "building", required = false) UUID buildingId,
                                                         @RequestParam(value = "floor", required = false) Integer floor) {
        List<ApartmentSummary> data = apartmentService.searchByAllInformation(keyword, buildingId, floor);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get apartment list successfully!",
                data
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> viewApartmentDetail(@PathVariable UUID id){
        ApartmentDetailDTO data = apartmentService.getApartmentDetail(id);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get apartment detail successfully!",
                data
        );
    }

    @PostMapping
    public ResponseEntity<Object> createApartment(@RequestBody ApartmentCreationDTO request){
        Apartment data = apartmentService.createResident(request);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Create apartment successfully!",
                data
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> changeApartmentOwner(@PathVariable(value = "id") UUID apartmentId, @RequestParam(value = "new_owner_id",  required = false) UUID ownerId){
        apartmentService.changeApartmentOwner(apartmentId, ownerId);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "",
                null
        );
    }

    @DeleteMapping
    public ResponseEntity<Object> deleteResident(@RequestParam(value = "id", required = true) UUID id){
        apartmentService.deleteApartment(id);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Deleted resident successfully!",
                null
        );
    }
}
