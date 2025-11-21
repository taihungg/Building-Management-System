package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.projection.ApartmentSummary;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.model.projection.ApartmentDropdown;
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
        List<ApartmentDropdown> data = apartmentService.searchApartmentDropdown(keyword);

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
}
