package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import itep.software.bluemoon.model.projection.Dropdown;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.entity.person.Resident;
import itep.software.bluemoon.model.DTO.ResidentCreationDTO;
import itep.software.bluemoon.model.DTO.ResidentDetailDTO;
import itep.software.bluemoon.model.DTO.ResidentUpdateDTO;
import itep.software.bluemoon.model.projection.ResidentSummary;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.ResidentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("api/v1/residents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ResidentController {
    private final ResidentService residentService;

    @GetMapping("/dropdown")
    public ResponseEntity<Object> searchForDropdown(@RequestParam("keyword") String keyword) {
        List<Dropdown> data = residentService.searchForDropdown(keyword);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get dropdown apartment successfully!",
                data
        );
    }

    @GetMapping
    public ResponseEntity<Object> searchByAllInformation(@RequestParam(value = "keyword", required = false) String keyword, @RequestParam(value = "include_inactive", defaultValue = "false") boolean includeInactive){
        List<ResidentSummary> data = residentService.searchByAllInformation(keyword, includeInactive);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get resident list successfully!",
                data
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> viewResidentDetail(@PathVariable UUID id){
        ResidentDetailDTO data = residentService.getResidentDetail(id);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get resident detail successfully!",
                data
        );
    }

    @PostMapping
    public ResponseEntity<Object> createResident(@RequestBody ResidentCreationDTO request){
        Resident data = residentService.createResident(request);

        return ApiResponse.responseBuilder(
                HttpStatus.CREATED,
                "Create resident successfully!",
                data
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateResident(@PathVariable UUID id, @RequestBody ResidentUpdateDTO request){
        Resident data = residentService.updateResident(id, request);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Update resident successfully!",
                data
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteResident(@PathVariable UUID id,
                               @RequestParam(value = "hard" /* true nếu muốn vĩnh viễn */, defaultValue = "false") boolean hardDelete){
        if (hardDelete) {
            residentService.deleteResident(id); // Gọi hàm xóa vĩnh viễn
        } else {
            residentService.changeResidentToInactive(id); // Gọi hàm đổi trạng thái
        }

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Deleted resident successfully!",
                null
        );
    }
}
