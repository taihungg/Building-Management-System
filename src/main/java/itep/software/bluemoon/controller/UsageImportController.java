package itep.software.bluemoon.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import itep.software.bluemoon.model.DTO.accounting.usage.UsageImportDTO;
import itep.software.bluemoon.response.ApiResponse;
import itep.software.bluemoon.service.UsageImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/accounting/usage-import")
@RequiredArgsConstructor
@Slf4j
public class UsageImportController {
    private final UsageImportService usageImportService;

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> preview(@RequestParam(value = "file", required = true) MultipartFile file, @RequestParam(value = "month", required = true) Integer month, @RequestParam(value = "year", required = true) Integer year) {
        List<UsageImportDTO> data = usageImportService.parseAndValidate(file, month, year);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get resident detail successfully!",
                data
        );
    }

    // API 2: Lưu chính thức (Save)
    @PostMapping("/save")
    public ResponseEntity<Object> saveImport(@RequestBody List<UsageImportDTO> data, @RequestParam(value = "month", required = true) Integer month, @RequestParam(value = "year", required = true) Integer year) {
        usageImportService.saveToDatabase(data, month, year);

        return ApiResponse.responseBuilder(
                HttpStatus.OK,
                "Get resident detail successfully!",
                null
        );
    }
}
