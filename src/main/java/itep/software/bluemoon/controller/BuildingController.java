package itep.software.bluemoon.controller;

import itep.software.bluemoon.model.projection.Dropdown;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.BuildingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/buildings")
@CrossOrigin(origins = "*")
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
}
