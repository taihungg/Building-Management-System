package itep.software.bluemoon.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import itep.software.bluemoon.model.DTO.accounting.extra.ExtraFeeCreationDTO;
import itep.software.bluemoon.model.DTO.accounting.extra.ExtraFeeDetailDTO;
import itep.software.bluemoon.model.projection.ExtraFeeSummary;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.ExtraFeeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/extrafee")
@RequiredArgsConstructor
public class ExtraFeeController {
    private final ExtraFeeService extraFeeService;

    @GetMapping("/{id}")
    public ResponseEntity<Object> viewExtraFeeDetail(@PathVariable(value = "id") UUID id){
        ExtraFeeDetailDTO data = extraFeeService.getExtraFeeDetail(id);

        return ApiResponse.responseBuilder(
                HttpStatus.OK, 
                "Get extra fee detail successfully!",
                data
        );
    }

    @GetMapping
    public ResponseEntity<Object> searchByAllInformation(@RequestParam(value = "keyword") String keyword){
        List<ExtraFeeSummary> data = extraFeeService.searchByAllInformation(keyword);

        return ApiResponse.responseBuilder(
                HttpStatus.OK, 
                "Get extra fee summary successfully!",
                data
        );
    }

    @PostMapping
    public ResponseEntity<Object> createExtraFee(@RequestBody ExtraFeeCreationDTO request){
        ExtraFeeDetailDTO data = extraFeeService.createExtraFee(request);

        return ApiResponse.responseBuilder(
                HttpStatus.OK, 
                "Create extra fee successfully!", 
                data
        );
    }
}
