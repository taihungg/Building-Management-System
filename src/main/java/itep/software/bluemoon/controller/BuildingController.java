package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.BuildingService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.DTO.apartment.BuildingCreationDTO;

@RestController
@RequestMapping("api/v1/buildings")
@RequiredArgsConstructor
public class BuildingController {
    private final BuildingService buildingService;

    @GetMapping("/dropdown")
    public ResponseEntity<Object> searchForDropdown(@RequestParam("keyword") String keyword) {
        List<Dropdown> data = buildingService.searchForDropdown(keyword);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get dropdown apartment successfully!",
                data
        );
    }

    @PostMapping
    public ResponseEntity<Object> createBuilding(@RequestBody BuildingCreationDTO request){
        buildingService.createBuilding(request);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Create apartment successfully!",
                null
        );
    }

    @DeleteMapping
    public ResponseEntity<Object> deleteBuilding(@RequestParam(value = "id", required = true) UUID id){
        buildingService.deleteBuilding(id);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Deleted resident successfully!",
                null
        );
    }
}
